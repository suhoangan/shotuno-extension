import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { STORAGE_PRESETS, type AuthTierPreset } from './storagePresets';

type ExtensionFixtures = {
  extensionContext: BrowserContext;
  extensionPage: Page;
  mountEditor: () => Promise<void>;
  setAuthState: (preset: AuthTierPreset) => Promise<void>;
};

const pathToExtension = path.resolve(process.cwd(), 'dist');
const userDataDir = path.resolve(process.cwd(), '.playwright-user-data');


const DUMMY_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const test = base.extend<ExtensionFixtures>({
  extensionContext: async ({}, use) => {
    fs.rmSync(userDataDir, { recursive: true, force: true });
    console.log('[E2E Path To Extension]:', pathToExtension);
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        '--headless=new',
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
      ],
    });

    try {
      await use(context);
    } finally {
      await context.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  },


  extensionPage: async ({ extensionContext }, use) => {
    const page = await extensionContext.newPage();
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
    await use(page);
    await page.close();
  },

  mountEditor: async ({ extensionContext, extensionPage }, use) => {
    const mountFn = async () => {
      const dummyImageDataUrl = await extensionPage.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(100, 100, 600, 400);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Shotuno E2E Test Canvas (800x600)', 140, 160);
        return canvas.toDataURL('image/png');
      });

      let workers = extensionContext.serviceWorkers();
      let worker = workers[0];
      if (!worker) {
        try {
          worker = await Promise.race([
            extensionContext.waitForEvent('serviceworker'),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 2000)),
          ]);
        } catch {
          workers = extensionContext.serviceWorkers();
          worker = workers[0];
        }
      }

      if (worker) {
        await worker.evaluate(async (img) => {
          const tabs = await chrome.tabs.query({});
          const targetTab = tabs.find((t) => t.id && t.url?.includes('example.com')) || tabs[0];
          if (!targetTab?.id) throw new Error('No target tab found');

          const manifest = chrome.runtime.getManifest();
          const csFile = manifest.content_scripts?.[0]?.js?.[0];
          if (csFile) {
            try {
              await chrome.scripting.executeScript({
                target: { tabId: targetTab.id },
                files: [csFile],
              });
            } catch {}
          }

          await new Promise((r) => setTimeout(r, 250));
          await chrome.tabs.sendMessage(targetTab.id, { type: 'TOGGLE_EDITOR', payload: img });
        }, dummyImageDataUrl);
      }

      // Guarantee the HTML5 canvas element is fully loaded and rendered inside shadow root
      await extensionPage.waitForFunction(() => {
        const shadow = document.getElementById('shotuno-root')?.shadowRoot;
        return Boolean(shadow?.querySelector('canvas'));
      }, { timeout: 10000 });
    };

    await use(mountFn);
  },












  setAuthState: async ({ extensionContext, extensionPage }, use) => {
    const setAuthStateFn = async (preset: AuthTierPreset) => {
      const data = STORAGE_PRESETS[preset];

      // 1. If service worker is already active, evaluate storage directly
      const workers = extensionContext.serviceWorkers();
      if (workers.length > 0) {
        await workers[0].evaluate(async (state) => {
          await chrome.storage.local.clear();
          if (state.authToken) await chrome.storage.local.set({ authToken: state.authToken });
          if (state.authUser) await chrome.storage.local.set({ authUser: state.authUser });
          if (state.pro_license_status) await chrome.storage.local.set({ pro_license_status: state.pro_license_status });
        }, data);
        return;
      }

      // 2. Direct page fallback evaluation
      await extensionPage.evaluate(async (state) => {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          await chrome.storage.local.clear();
          if (state.authToken) await chrome.storage.local.set({ authToken: state.authToken });
          if (state.authUser) await chrome.storage.local.set({ authUser: state.authUser });
          if (state.pro_license_status) await chrome.storage.local.set({ pro_license_status: state.pro_license_status });
        }
      }, data);
    };

    await use(setAuthStateFn);
  },

});

export { expect } from '@playwright/test';

/** Single source of truth helper to locate elements inside Shotuno Shadow DOM overlay */
export function getShadowAppContainer(page: Page) {
  return page.locator('#shotuno-app-container');
}


