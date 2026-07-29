import { injectGemini } from './geminiInject';

function waitForElement(selector: string, timeout = 15000): Promise<HTMLElement> {
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

function insertText(element: HTMLElement, text: string) {
  element.focus();
  try {
    document.execCommand('insertText', false, text);
  } catch {
    element.textContent = (element.textContent || '') + text;
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
  }
}

function resolveEditor(element: HTMLElement): HTMLElement {
  if (element.classList.contains('ql-editor') || element.isContentEditable) return element;
  return (
    (element.querySelector('.ql-editor[contenteditable="true"], [contenteditable="true"]') as HTMLElement) ||
    element
  );
}

function buildDataTransfer(file: File, text: string): DataTransfer {
  const dt = new DataTransfer();
  if (text) dt.setData('text/plain', text);
  dt.items.add(file);
  return dt;
}

function dispatchPaste(element: HTMLElement, file: File, text: string): boolean {
  const dt = buildDataTransfer(file, text);
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  Object.defineProperty(pasteEvent, 'clipboardData', { value: dt, enumerable: true });
  return element.dispatchEvent(pasteEvent);
}

function dispatchDrop(element: HTMLElement, file: File, text: string): boolean {
  const dt = buildDataTransfer(file, text);
  for (const type of ['dragenter', 'dragover', 'drop'] as const) {
    const event = new DragEvent(type, { bubbles: true, cancelable: true, composed: true });
    Object.defineProperty(event, 'dataTransfer', { value: dt, enumerable: true });
    element.dispatchEvent(event);
  }
  return true;
}

function attachViaFileInput(file: File): boolean {
  const inputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
  const input =
    inputs.find((el) => {
      const accept = (el.accept || '').toLowerCase();
      return !accept || accept.includes('image') || accept.includes('png') || accept.includes('*') || accept.includes('file');
    }) || inputs[0];

  if (!input) return false;

  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

async function injectDefault(element: HTMLElement, text: string, dataUrl: string) {
  const file = await dataUrlToFile(dataUrl, 'screenshot.png');
  const editor = resolveEditor(element);
  editor.focus();

  if (text) {
    insertText(editor, text);
    await sleep(150);
  }

  if (attachViaFileInput(file)) {
    console.log('Shotuno: Attached image via file input');
    return;
  }
  if (dispatchPaste(editor, file, text)) {
    console.log('Shotuno: Dispatched paste with image');
    return;
  }
  dispatchDrop(editor, file, text);
  console.log('Shotuno: Dispatched drop with image');
}

function composerSelector(hostname: string): string {
  if (hostname.includes('chatgpt.com')) {
    return '#prompt-textarea, [data-testid="composer-text-input"], div.ProseMirror[contenteditable="true"]';
  }
  if (hostname.includes('claude.ai')) {
    return 'div.ProseMirror[contenteditable="true"], [data-testid="chat-input"] div[contenteditable="true"], fieldset div[contenteditable="true"]';
  }
  return '';
}

export function initializeAIInjector() {
  const hostname = window.location.hostname;
  if (
    !hostname.includes('chatgpt.com') &&
    !hostname.includes('claude.ai') &&
    !hostname.includes('gemini.google.com')
  ) {
    return;
  }

  chrome.storage.local.get(['pendingAIInjection'], (result: { pendingAIInjection?: any }) => {
    const injection = result.pendingAIInjection;

    if (injection?.imageUri && Date.now() - injection.timestamp < 60000) {
      console.log('Shotuno: Found pending AI injection. Initiating...');
      chrome.storage.local.remove(['pendingAIInjection']);

      if (hostname.includes('gemini.google.com')) {
        // Gemini needs its own upload-menu flow; don't depend on a generic composer wait
        setTimeout(() => {
          injectGemini(injection.prompt || '', injection.imageUri).catch((err) =>
            console.error('Shotuno: Gemini injection failed', err),
          );
        }, 500);
        return;
      }

      const selector = composerSelector(hostname);
      if (!selector) return;

      waitForElement(selector)
        .then((el) => {
          setTimeout(() => {
            injectDefault(el, injection.prompt || '', injection.imageUri);
          }, 800);
        })
        .catch((err) => console.error('Shotuno: Injection failed', err));
    } else if (injection) {
      chrome.storage.local.remove(['pendingAIInjection']);
    }
  });
}
