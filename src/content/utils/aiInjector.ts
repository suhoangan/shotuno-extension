import { injectGemini } from './geminiInject';
import { storage } from '../../lib/chromeStorage';

import {
  assignFileToInput,
  dataUrlToFile,
  dispatchDrop,
  dispatchPaste,
  findFileInput,
  insertEditorText,
  sleep,
  waitForAttachment,
  waitForElement,
} from './aiInjectShared';

const COMPOSER_SELECTORS: Record<string, string> = {
  chatgpt:
    '#prompt-textarea, div.ProseMirror#prompt-textarea, div.ProseMirror[contenteditable="true"][role="textbox"]',
  claude:
    '[data-testid="chat-input"], div.ProseMirror[contenteditable="true"], div[aria-label*="Claude" i][contenteditable="true"]',
};

const FILE_INPUT_SELECTORS: Record<string, string[]> = {
  chatgpt: [
    '#upload-files',
    '#upload-photos',
    'form input[type="file"]:not([accept])',
    'input[type="file"][accept*="image"]',
  ],
  claude: [
    '#chat-input-file-upload-onpage',
    'input[type="file"][aria-label*="Upload" i]',
    'input[type="file"]',
  ],
};

function resolveEditor(element: HTMLElement): HTMLElement {
  if (element.isContentEditable || element.classList.contains('ProseMirror')) return element;
  return (
    (element.querySelector(
      '.ProseMirror[contenteditable="true"], [contenteditable="true"]',
    ) as HTMLElement) || element
  );
}

async function attachImage(provider: string, file: File): Promise<boolean> {
  const preferred = FILE_INPUT_SELECTORS[provider] || [];
  const input = findFileInput(preferred);
  if (!input) return false;
  if (!assignFileToInput(input, file)) return false;
  return waitForAttachment(4500);
}

async function injectComposer(provider: string, element: HTMLElement, text: string, dataUrl: string) {
  const file = await dataUrlToFile(dataUrl, 'screenshot.png');
  const editor = resolveEditor(element);
  editor.focus();
  await sleep(200);

  // Attach image first — ChatGPT/Claude enable send after the chip appears.
  let attached = await attachImage(provider, file);

  if (!attached) {
    editor.focus();
    if (dispatchPaste(editor, file, '')) {
      attached = await waitForAttachment(3000);
    }
  }
  if (!attached) {
    dispatchDrop(editor, file, '');
    attached = await waitForAttachment(3000);
  }

  if (text) {
    editor.focus();
    await sleep(100);
    insertEditorText(editor, text);
  }

  if (!attached) {
    console.warn(
      `Shotuno: Could not auto-attach on ${provider}. Image+prompt are on the clipboard — press Ctrl+V.`,
    );
  }
}

function providerForHost(hostname: string): 'chatgpt' | 'claude' | null {
  if (hostname.includes('chatgpt.com')) return 'chatgpt';
  if (hostname.includes('claude.ai')) return 'claude';
  return null;
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

  storage.local.get(['pendingAIInjection'], (result: { pendingAIInjection?: any }) => {
    const injection = result.pendingAIInjection;

    if (injection?.imageUri && Date.now() - injection.timestamp < 60000) {
      storage.local.remove(['pendingAIInjection']);

      if (hostname.includes('gemini.google.com')) {
        setTimeout(() => {
          injectGemini(injection.prompt || '', injection.imageUri).catch((err) =>
            console.error('Shotuno: Gemini injection failed', err),
          );
        }, 500);
        return;
      }

      const provider = providerForHost(hostname);
      const selector = provider ? COMPOSER_SELECTORS[provider] : '';
      if (!provider || !selector) return;

      waitForElement(selector)
        .then((el) => {
          setTimeout(() => {
            injectComposer(provider, el, injection.prompt || '', injection.imageUri).catch((err) =>
              console.error('Shotuno: Injection failed', err),
            );
          }, 800);
        })
        .catch((err) => console.error('Shotuno: Injection failed', err));
    } else if (injection) {
      storage.local.remove(['pendingAIInjection']);
    }
  });
}
