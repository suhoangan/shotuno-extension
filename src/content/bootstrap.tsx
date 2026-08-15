import { createRoot, type Root } from 'react-dom/client';
import App, { type BootstrapMessage } from './App';
import fontsCss from '../fonts.css?inline';
import tailwindCss from '../index.css?inline';
import { initializeAIInjector } from './utils/aiInjector';
import { hydrateEditorPrefs } from '../store/editorPrefs';
import { initTelemetry } from '../lib/telemetry';

initializeAIInjector();
hydrateEditorPrefs();
void initTelemetry();

const ROOT_ID = 'shotuno-root';

let reactRoot: Root | null = null;
let hostEl: HTMLElement | null = null;

export function destroyContentScript() {
  reactRoot?.unmount();
  reactRoot = null;
  hostEl?.remove();
  hostEl = null;
}

function ensureMounted(message: BootstrapMessage) {
  if (!reactRoot || !hostEl) {
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = ROOT_ID;
    // all:initial cuts page inheritance before our stylesheet paints.
    root.style.cssText = [
      'all: initial',
      'display: block',
      'position: fixed',
      'inset: 0',
      'width: 100%',
      'height: 100%',
      'margin: 0',
      'padding: 0',
      'border: none',
      'z-index: 2147483647',
      'pointer-events: none',
      'box-sizing: border-box',
      'overflow: hidden',
    ].join(';');
    document.body.appendChild(root);
    hostEl = root;

    const shadow = root.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `${fontsCss}\n${tailwindCss}`;
    shadow.appendChild(style);

    const appContainer = document.createElement('div');
    appContainer.id = 'shotuno-app-container';
    shadow.appendChild(appContainer);

    reactRoot = createRoot(appContainer);
  }

  reactRoot.render(<App bootstrap={message} onCloseEditor={destroyContentScript} />);
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;
    if (
      event.data.type === 'TOGGLE_EDITOR' ||
      event.data.type === 'TOGGLE_PREVIEW' ||
      event.data.type === 'START_AREA_SELECTION' ||
      event.data.type === 'START_PIN_AREA_SELECTION' ||
      event.data.type === 'START_FULL_PAGE_CAPTURE' ||
      event.data.type === 'START_GRID_CAPTURE'
    ) {
      ensureMounted(event.data as BootstrapMessage);
    }
  });
}

chrome.runtime.onMessage.addListener((message: BootstrapMessage | { type: string }, _sender, sendResponse) => {
  if (message.type === 'SHOTUNO_PING' || message.type === 'SHOTUNO_EDITOR_STATUS') {
    sendResponse({ ok: true, editing: Boolean(hostEl) });
    return false;
  }
  // Stale host with nothing mounted (e.g. after a failed capture) — tear down so
  // the next capture can remount cleanly.
  if (
    hostEl &&
    !reactRoot &&
    (message.type === 'TOGGLE_EDITOR' ||
      message.type === 'TOGGLE_PREVIEW' ||
      message.type === 'START_AREA_SELECTION' ||
      message.type === 'START_PIN_AREA_SELECTION' ||
      message.type === 'START_FULL_PAGE_CAPTURE' ||
      message.type === 'START_GRID_CAPTURE')
  ) {
    destroyContentScript();
  }
  if (message.type === 'START_PIN_AREA_SELECTION' && hostEl) {
    // Editor or capture already open on this tab — ignore pin capture.
    return false;
  }
  if (
    message.type === 'TOGGLE_EDITOR' ||
    message.type === 'TOGGLE_PREVIEW' ||
    message.type === 'START_AREA_SELECTION' ||
    message.type === 'START_PIN_AREA_SELECTION' ||
    message.type === 'START_FULL_PAGE_CAPTURE' ||
    message.type === 'START_GRID_CAPTURE'
  ) {
    ensureMounted(message as BootstrapMessage);
  }
  return false;
});

