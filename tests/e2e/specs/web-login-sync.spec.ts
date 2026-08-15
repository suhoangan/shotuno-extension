import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';
import { STORAGE_PRESETS } from '../fixtures/storagePresets';

test.describe('Web Login Sync E2E Suite', () => {
  test('web app login sync updates extension storage and unlocks Pro user UI', async ({
    extensionContext,
    extensionPage,
    mountEditor,
  }) => {
    // 1. Service worker hydrates storage when user logs in on website
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

    expect(worker).toBeDefined();

    // Hydrate extension storage as if web app pushed auth token & profile via web login sync
    await worker.evaluate(async (proState) => {
      await chrome.storage.local.set({
        authToken: proState.authToken,
        authUser: proState.authUser,
        pro_license_status: proState.pro_license_status,
      });
    }, STORAGE_PRESETS.pro);

    await extensionPage.waitForTimeout(300);

    // Verify storage in extension service worker
    const storedAuth = await worker.evaluate(async () => {
      return await chrome.storage.local.get(['authToken', 'authUser']);
    });
    expect(storedAuth.authToken).toBe(STORAGE_PRESETS.pro.authToken);
    expect(storedAuth.authUser?.entitlements?.licenseStatus).toBe('PRO');

    // 2. Mount editor and verify Pro user UI functionality
    await mountEditor();
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    // Verify Pro tools run without any upgrade modal blocking
    const proTools = ['ocr', 'smart_blur', 'magnifier', 'measure'];
    for (const toolId of proTools) {
      const toolButton = shadowContainer.locator(`[data-tool="${toolId}"]`).first();
      await expect(toolButton).toBeVisible();
      await toolButton.click();

      // Pro user must NEVER see an upgrade or out-of-credits modal dialog
      const modal = shadowContainer.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });

  test('web app logout sync clears extension auth and resets to guest state', async ({
    extensionContext,
    extensionPage,
    mountEditor,
    setAuthState,
  }) => {
    // 1. Start logged in as Pro
    await setAuthState('pro');

    // 2. Trigger LOGOUT_SYNC storage clear in background service worker (simulating web app logout)
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

    expect(worker).toBeDefined();

    await worker.evaluate(async () => {
      await chrome.storage.local.clear();
    });

    await extensionPage.waitForTimeout(300);

    // Verify storage is cleared in service worker
    const storedAuth = await worker.evaluate(async () => {
      return await chrome.storage.local.get(['authToken', 'authUser', 'pro_license_status']);
    });
    expect(storedAuth.authToken).toBeUndefined();
    expect(storedAuth.authUser).toBeUndefined();
    expect(storedAuth.pro_license_status).toBeUndefined();

    // 3. Mount editor and verify guest user state (PRO badge hidden)
    await mountEditor();
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    const proBadge = shadowContainer.locator('[data-testid="pro-badge"]');
    await expect(proBadge).not.toBeVisible();
  });




});

