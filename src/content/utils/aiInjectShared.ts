const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export { sleep };

export function waitForElement(selector: string, timeout = 15000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing as HTMLElement);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el as HTMLElement);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);
  });
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

/** ProseMirror / TipTap / Quill-safe text insert. */
export function insertEditorText(element: HTMLElement, text: string) {
  element.focus();
  element.classList.remove('ql-blank');

  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  if (document.execCommand('insertText', false, text)) {
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    return;
  }

  const before = element.textContent || '';
  const dt = new DataTransfer();
  dt.setData('text/plain', text);
  const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true, composed: true });
  Object.defineProperty(paste, 'clipboardData', { value: dt, enumerable: true });
  const prevented = !element.dispatchEvent(paste);
  const after = element.textContent || '';
  if (prevented || after !== before) return;

  element.textContent = text;
  element.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
}

function assignFileList(input: HTMLInputElement, files: FileList): boolean {
  const proto = Object.getPrototypeOf(input) as HTMLInputElement;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'files');
  if (descriptor?.set) {
    try {
      descriptor.set.call(input, files);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    Object.defineProperty(input, 'files', {
      configurable: true,
      get: () => files,
    });
    return true;
  } catch {
    /* fall through */
  }
  try {
    input.files = files;
    return true;
  } catch {
    return false;
  }
}

function fireReactChange(input: HTMLInputElement) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  const key = Object.keys(input).find((k) => k.startsWith('__reactProps$'));
  if (!key) return;
  const props = (input as unknown as Record<string, { onChange?: (e: unknown) => void }>)[key];
  props?.onChange?.({ target: input, currentTarget: input, type: 'change', bubbles: true });
}

export function assignFileToInput(input: HTMLInputElement, file: File): boolean {
  const dt = new DataTransfer();
  dt.items.add(file);
  if (!assignFileList(input, dt.files)) return false;
  fireReactChange(input);
  return input.files?.length === 1;
}

export function findFileInput(preferredSelectors: string[]): HTMLInputElement | null {
  for (const sel of preferredSelectors) {
    const el = document.querySelector(sel);
    if (el instanceof HTMLInputElement && el.type === 'file') return el;
  }
  const inputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
  return (
    inputs.find((el) => {
      const accept = (el.accept || '').toLowerCase();
      return !accept || accept.includes('image') || accept.includes('png') || accept.includes('*');
    }) ||
    inputs[0] ||
    null
  );
}

export function buildDataTransfer(file: File, text: string): DataTransfer {
  const dt = new DataTransfer();
  if (text) dt.setData('text/plain', text);
  dt.items.add(file);
  return dt;
}

export function dispatchPaste(element: HTMLElement, file: File, text: string): boolean {
  const dt = buildDataTransfer(file, text);
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  Object.defineProperty(pasteEvent, 'clipboardData', { value: dt, enumerable: true });
  // preventDefault => handler accepted the paste
  return !element.dispatchEvent(pasteEvent);
}

export function dispatchDrop(element: HTMLElement, file: File, text: string) {
  const dt = buildDataTransfer(file, text);
  for (const type of ['dragenter', 'dragover', 'drop'] as const) {
    const event = new DragEvent(type, { bubbles: true, cancelable: true, composed: true });
    Object.defineProperty(event, 'dataTransfer', { value: dt, enumerable: true });
    element.dispatchEvent(event);
  }
}

const ATTACHMENT_SELECTORS = [
  '[data-testid="file-thumbnail"]',
  '[data-testid*="file-preview"]',
  '[data-testid*="attachment"]',
  '[data-testid*="composer-attachment"]',
  'img[alt*="screenshot" i]',
  'img[src^="blob:"]',
  'img[src^="data:image"]',
  'button[aria-label*="Remove" i]',
  'button[aria-label*="remove file" i]',
  'filetype-icon',
  'uploaded-image',
  '.input-chip',
].join(', ');

export function hasAttachmentChip(): boolean {
  return !!document.querySelector(ATTACHMENT_SELECTORS);
}

export async function waitForAttachment(timeoutMs = 5000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (hasAttachmentChip()) return true;
    await sleep(200);
  }
  return hasAttachmentChip();
}
