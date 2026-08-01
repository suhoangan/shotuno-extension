import { defineManifest } from '@crxjs/vite-plugin'
import { loadEnv } from 'vite'

function originPattern(url: string): string {
  try {
    return `${new URL(url).origin}/*`
  } catch {
    return `${url.replace(/\/$/, '')}/*`
  }
}

function isPublicWebOrigin(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    const host = parsed.hostname.toLowerCase()
    return host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.local')
  } catch {
    return false
  }
}

export default defineManifest(async (env) => {
  const vars = loadEnv(env.mode, process.cwd(), '')
  const webUrl = vars.VITE_WEB_URL || ''
  const isProd = env.mode === 'production'

  // captureVisibleTab needs host access on the page being captured.
  const hostPermissions = new Set<string>(['<all_urls>'])

  if (webUrl && (!isProd || isPublicWebOrigin(webUrl))) {
    hostPermissions.add(originPattern(webUrl))
  }

  const externallyConnectableMatches: string[] = []
  if (webUrl) {
    try {
      const origin = new URL(webUrl).origin
      if (!isProd || isPublicWebOrigin(webUrl)) {
        externallyConnectableMatches.push(`${origin}/*`)
      }
    } catch {
      /* ignore invalid VITE_WEB_URL */
    }
  }
  // Local Next.js default when developing against localhost web.
  if (!isProd) {
    for (const origin of ['http://localhost:3001/*', 'http://127.0.0.1:3001/*']) {
      if (!externallyConnectableMatches.includes(origin)) {
        externallyConnectableMatches.push(origin)
      }
    }
  }

  return {
    manifest_version: 3,
    name: 'Shotuno',
    short_name: 'Shotuno',
    version: '1.0.0',
    description:
      'Capture visible, area, or full-page screenshots and annotate them in-tab - arrows, blur, OCR, pins, and more.',
    ...(webUrl && isPublicWebOrigin(webUrl)
      ? { homepage_url: webUrl.replace(/\/$/, '') }
      : {}),
    ...(externallyConnectableMatches.length
      ? { externally_connectable: { matches: externallyConnectableMatches } }
      : {}),
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
      'cookies',
      // DevTools-style full-page capture (Page.captureScreenshot beyond viewport).
      'debugger',
    ],
    host_permissions: [...hostPermissions],
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
