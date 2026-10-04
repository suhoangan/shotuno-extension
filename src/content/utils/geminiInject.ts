import {
  assignFileToInput,
  dataUrlToFile,
  dispatchPaste,
  findFileInput,
  hasAttachmentChip,
  insertEditorText,
  sleep,
  waitForAttachment,
  waitForElement,
} from './aiInjectShared';
import {
  findDynamicComposer,
  findDynamicFileInput,
  waitForDynamicComposer,
} from './dynamicComposer';

function bridge(type: 'patch-file-click' | 'restore-file-click') {
  window.postMessage({ source: 'shotuno-bridge', type }, 'https://gemini.google.com');
}

/** Locale-agnostic: English "Upload & tools" or first non-mic icon in the input area. */
function findToolsButton(): HTMLElement | null {
  const area = document.querySelector('[data-node-type="input-area"]');
  if (!area) {
    return document.querySelector<HTMLElement>(
      'button[aria-label="Upload & tools"], button[aria-label*="Upload" i][aria-label*="tool" i]',
    );
  }

  const exact = area.querySelector<HTMLElement>('button[aria-label="Upload & tools"]');
  if (exact) return exact;

  const buttons = Array.from(area.querySelectorAll('button')) as HTMLElement[];
  const byLabel = buttons.find((b) => {
    const aria = (b.getAttribute('aria-label') || '').toLowerCase();
    return (
      (/upload|tool|tải|fichier|hochladen|subir|carregar|添付|上传|outil|werkzeug/.test(aria) &&
        !/mic|microphone|micrô|mikrofon/.test(aria)) ||
      false
    );
  });
  if (byLabel) return byLabel;

  return (
    buttons.find((b) => {
      if (b.getAttribute('data-test-id') === 'bard-mode-menu-button') return false;
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      if (/mic|microphone|micrô|mikrofon/.test(aria)) return false;
      return b.classList.contains('mat-mdc-icon-button');
    }) || null
  );
}

function findGeminiEditor(): HTMLElement | null {
  return (
    findDynamicComposer('gemini') ||
    document.querySelector(
      '.ql-editor[contenteditable="true"], rich-textarea .ql-editor, .ql-editor',
    )
  );
}

async function uploadViaMenu(file: File): Promise<boolean> {
  bridge('patch-file-click');
  try {
    const toolsBtn = findToolsButton();
    if (!toolsBtn) {
      console.warn('Shotuno: Gemini Upload & tools button not found');
      return false;
    }
    toolsBtn.click();
    await sleep(400);

    if (document.querySelector('[data-test-id="sign-out-banner"]')) {
      console.warn('Shotuno: Gemini requires sign-in to upload files');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return false;
    }

    const uploadFilesBtn = await waitForElement(
      [
        '[data-test-id="local-images-files-uploader-button"]',
        'images-files-uploader[data-test-id="uploader-images-files-button-advanced"] button:not(.hidden-local-file-image-selector-button)',
        'images-files-uploader[data-test-id="uploader-images-files-button-basic"] button:not(.hidden-local-file-image-selector-button)',
        '[data-test-id="hidden-local-image-upload-button"]',
        'button[aria-label*="Upload files" i]',
        'button[aria-label*="Tải tệp" i]',
      ].join(', '),
      6000,
    );
    uploadFilesBtn.click();
    await sleep(500);

    const fileInput =
      findFileInput([
        'input[name="Filedata"]',
        'images-files-uploader input[type="file"]',
        'input[type="file"]',
      ]) ||
      findDynamicFileInput() ||
      ((await waitForElement('input[type="file"]', 6000)) as HTMLInputElement);

    if (!assignFileToInput(fileInput, file)) return false;
    await sleep(800);
    return (await waitForAttachment(4000)) || fileInput.files?.length === 1;
  } catch (err) {
    console.error('Shotuno: Gemini upload menu failed', err);
    return false;
  } finally {
    bridge('restore-file-click');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }
}

export async function injectGemini(text: string, dataUrl: string) {
  const file = await dataUrlToFile(dataUrl, 'screenshot.png');

  let editor: HTMLElement;
  try {
    editor = await waitForDynamicComposer({ provider: 'gemini', timeoutMs: 20000 });
  } catch {
    editor = await waitForElement(
      '.ql-editor[contenteditable="true"], .ql-editor, rich-textarea .ql-editor',
      10000,
    );
  }
  await sleep(800);
  editor.focus();

  let attached = await uploadViaMenu(file);

  if (!attached) {
    const pasteTarget =
      document.querySelector<HTMLElement>('.ql-clipboard') || findGeminiEditor() || editor;
    pasteTarget.focus();
    if (dispatchPaste(pasteTarget, file, '')) {
      attached = await waitForAttachment(3000);
    }
    if (!attached) attached = hasAttachmentChip();
  }

  const liveEditor = findGeminiEditor() || editor;
  if (text) {
    liveEditor.focus();
    insertEditorText(liveEditor, text);
  }

  if (!attached) {
    console.warn(
      'Shotuno: Could not auto-attach image on Gemini. Image+prompt are on the clipboard — press Ctrl+V.',
    );
    showFallbackBanner();
  }
}

function showFallbackBanner() {
  if (document.getElementById('shotuno-gemini-fallback')) return;
  const el = document.createElement('div');
  el.id = 'shotuno-gemini-fallback';
  el.textContent =
    'Shotuno: Sign in to Gemini, click the prompt box, then press Ctrl+V to paste image + prompt.';
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
