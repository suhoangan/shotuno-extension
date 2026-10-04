import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(() => {
  return {
    manifest_version: 3,
    name: 'Shotuno',
    short_name: 'Shotuno',
    default_locale: 'en',
    version: '1.0.2',
    description:
      'Capture visible, area, or full-page screenshots and annotate them in-tab - arrows, blur, OCR, pins, and more.',
    homepage_url: 'https://github.com/suhoangan/shotuno-extension',
    action: {
      default_title: 'Shotuno - Capture & annotate',
      default_popup: 'src/popup/index.html',
      default_icon: 'icon-32.png',
    },
    side_panel: {
      default_path: 'src/sidepanel/index.html',
    },
    icons: {
      '16': 'icon-16.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
    options_page: 'src/onboarding/index.html',
    // Side Panel API requires Chrome 114+
    minimum_chrome_version: '114',
    permissions: [
      'activeTab',
      'tabs',
      'storage',
      'unlimitedStorage',
      'downloads',
      'scripting',
      'sidePanel',
      'contextMenus',
      'debugger',
    ],
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['src/content/index.tsx'],
      },
      {
        matches: ['https://gemini.google.com/*'],
        js: ['src/content/pageBridge.ts'],
        world: 'MAIN',
        run_at: 'document_start',
      },
    ],
  }
})
