const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bridge(type: 'patch-file-click' | 'restore-file-click') {
  window.postMessage({ source: 'shotuno-bridge', type }, 'https://gemini.google.com');
}

function waitForSelector(selector: string, timeout = 10000): Promise<HTMLElement> {
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
      reject(new Error(`Not found: ${selector}`));
    }, timeout);
  });
}

function insertQuillText(editor: HTMLElement, text: string) {
  editor.focus();
  editor.classList.remove('ql-blank');
  editor.innerHTML = text
    .split('\n')
    .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
    .join('');
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
}

function findGeminiEditor(): HTMLElement | null {
  return document.querySelector(
    '.ql-editor[contenteditable="true"], rich-textarea .ql-editor, [aria-label="Enter a prompt for Gemini"]',
  );
}

function hasAttachment(): boolean {
  return !!document.querySelector(
    [
      'filetype-icon',
      '[data-test-id*="file-preview"]',
      '[data-test-id*="attachment"]',
      '.input-chip',
      'uploaded-image',
      '[class*="preview-image"]',
      'img[src^="blob:"]',
      'img[src^="data:image"]',
    ].join(', '),
  );
}

function assignFile(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function uploadViaMenu(file: File): Promise<boolean> {
  bridge('patch-file-click');
  try {
    const toolsBtn = document.querySelector<HTMLElement>(
      'button[aria-label="Upload & tools"], [data-node-type="input-area"] button[aria-label="Upload & tools"]',
    );
    if (!toolsBtn) {
      console.warn('Shotuno: Gemini Upload & tools button not found');
      return false;
    }
    toolsBtn.click();
    await sleep(400);

    // Guest sessions show a sign-in CTA instead of a working uploader
    if (document.querySelector('[data-test-id="sign-out-banner"]')) {
      console.warn('Shotuno: Gemini requires sign-in to upload files');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return false;
    }

    const uploadFilesBtn = await waitForSelector(
      [
        '[data-test-id="local-images-files-uploader-button"]',
        'images-files-uploader[data-test-id="uploader-images-files-button-advanced"] button:not(.hidden-local-file-image-selector-button)',
        'images-files-uploader[data-test-id="uploader-images-files-button-basic"] button:not(.hidden-local-file-image-selector-button)',
        'button[aria-label*="Upload files" i]',
      ].join(', '),
      6000,
    );
    uploadFilesBtn.click();
    await sleep(500);

    const fileInput = (await waitForSelector(
      'input[name="Filedata"], images-files-uploader input[type="file"], input[type="file"]',
      6000,
    )) as HTMLInputElement;

    assignFile(fileInput, file);
    await sleep(1000);
    return hasAttachment() || fileInput.files?.length === 1;
  } catch (err) {
    console.error('Shotuno: Gemini upload menu failed', err);
    return false;
  } finally {
    bridge('restore-file-click');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }
}

export async function injectGemini(text: string, dataUrl: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], 'screenshot.png', { type: blob.type || 'image/png' });

  const editor = await waitForSelector(
    '.ql-editor[contenteditable="true"], .ql-editor, [aria-label="Enter a prompt for Gemini"]',
    20000,
  );
  // Give Angular/Quill time to bind listeners after first paint
  await sleep(800);
  editor.focus();

  let attached = await uploadViaMenu(file);

  if (!attached) {
    // Fallback: paste onto Quill editor / hidden clipboard target
    const pasteTarget =
      document.querySelector<HTMLElement>('.ql-clipboard') || findGeminiEditor() || editor;
    pasteTarget.focus();
    const dt = new DataTransfer();
    dt.items.add(file);
    const pasteEvent = new ClipboardEvent('paste', { bubbles: true, cancelable: true, composed: true });
    Object.defineProperty(pasteEvent, 'clipboardData', { value: dt, enumerable: true });
    pasteTarget.dispatchEvent(pasteEvent);
    await sleep(600);
    attached = hasAttachment();
  }

  const liveEditor = findGeminiEditor() || editor;
  if (text) insertQuillText(liveEditor, text);

  if (!attached) {
    console.warn(
      'Shotuno: Could not auto-attach image on Gemini. Image+prompt are on the clipboard — press Ctrl+V.',
    );
    showFallbackBanner();
  } else {
    console.log('Shotuno: Gemini image attached successfully');
  }
}

function showFallbackBanner() {
  if (document.getElementById('shotuno-gemini-fallback')) return;
  const el = document.createElement('div');
  el.id = 'shotuno-gemini-fallback';
  el.textContent = 'Shotuno: Sign in to Gemini, click the prompt box, then press Ctrl+V to paste image + prompt.';
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    background: '#0b3d3a',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '10px',
    font: '13px/1.4 system-ui,sans-serif',
    boxShadow: '0 8px 24px rgba(0,0,0,.2)',
    maxWidth: 'min(480px, 92vw)',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 12000);
}
