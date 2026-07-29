import { defineManifest } from '@crxjs/vite-plugin'
import { loadEnv } from 'vite'

function originPattern(url: string): string {
  try {
    return `${new URL(url).origin}/*`
  } catch {
    return `${url.replace(/\/$/, '')}/*`
  }
}

export default defineManifest(async (env) => {
  const vars = loadEnv(env.mode, process.cwd(), '')
  const webUrl = vars.VITE_WEB_URL || 'http://localhost:3001'

  // captureVisibleTab needs host access on the page being captured.
  const hostPermissions = [
    '<all_urls>',
    originPattern(webUrl),
    'https://*.ingest.sentry.io/*',
  ]

  return {
    manifest_version: 3,
    name: 'Shotuno',
    version: '1.0.0',
    description: 'Capture and annotate screenshots natively in the browser.',
    action: {
      default_title: 'Shotuno',
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
    permissions: [
      'activeTab',
      'tabs',
      'storage',
      'unlimitedStorage',
      'downloads',
      'scripting',
      'sidePanel',
    ],
    host_permissions: hostPermissions,
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
