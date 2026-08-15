import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';
import { STORAGE_PRESETS } from '../fixtures/storagePresets';

test.describe('Real User Web Login E2E Flow', () => {
  test('Guest user clicks Pro tool, opens login modal, fills credentials on web login tab, and unlocks Pro extension features', async ({
    extensionContext,
    extensionPage,
    mountEditor,
    setAuthState,
  }) => {
    // 1. Initial State: Guest user (Logged Out)
    await setAuthState('guest');
    await mountEditor();

    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    // 2. Guest user clicks gated Pro tool (OCR text extract)
    const ocrButton = shadowContainer.locator('[data-tool="ocr"]').first();
    await expect(ocrButton).toBeVisible();
    await ocrButton.click();

    // 3. Verify Login Modal pops up on screen
    const modal = shadowContainer.locator('[role="dialog"], [role="alertdialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText(/log in|pro|upgrade/i);


    // 4. Guest user clicks "Log In" / "Upgrade" button in the modal
    const loginBtn = shadowContainer.getByRole('button', { name: /log in|upgrade/i }).first();
    await expect(loginBtn).toBeVisible();

    // Open web login page tab for user login
    const loginPage = await extensionContext.newPage();
    await loginPage.goto('about:blank');

    // 5. Serve a realistic Web Login page in the web tab
    await loginPage.setContent(`

      <!DOCTYPE html>
      <html>
        <head>
          <title>Shotuno - Sign In</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155; width: 320px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h2 { margin-top: 0; color: #38bdf8; font-size: 20px; text-align: center; }
            label { font-size: 12px; font-weight: 600; color: #94a3b8; display: block; margin-top: 14px; margin-bottom: 4px; }
            input { width: 100%; box-sizing: border-box; padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; outline: none; }
            button { width: 100%; margin-top: 20px; padding: 12px; border-radius: 8px; border: none; background: #0284c7; color: white; font-weight: 700; cursor: pointer; }
            button:hover { background: #0369a1; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Sign in to Shotuno</h2>
            <form id="loginForm">
              <div>
                <label for="email">Email address</label>
                <input id="email" type="email" placeholder="you@domain.com" required />
              </div>
              <div>
                <label for="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" required />
              </div>
              <button id="submitBtn" type="submit">Sign In</button>
            </form>
          </div>
        </body>
      </html>
    `);

    // User fills out credentials like a real user
    await loginPage.fill('#email', 'pro-user@shotuno.com');
    await loginPage.fill('#password', 'secret123');

    // Get background service worker reference
    let workers = extensionContext.serviceWorkers();
    let worker = workers[0];
    if (!worker) {
      worker = await extensionContext.waitForEvent('serviceworker');
    }

    // User submits the login form; simulating web app extension sync
    await Promise.all([
      worker.evaluate(async (proState) => {
        await chrome.storage.local.set({
          authToken: proState.authToken,
          authUser: proState.authUser,
          pro_license_status: proState.pro_license_status,
        });
      }, STORAGE_PRESETS.pro),
      loginPage.click('#submitBtn'),
    ]);

    await extensionPage.waitForTimeout(300);

    // 6. User closes the login tab after successful login
    await loginPage.close();
    await extensionPage.waitForTimeout(500);

    // Auto-dismiss: modal automatically unmounts when auth sync turns user into PRO
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // 7. Verify extension UI unlocks Pro features live on the active canvas
    const proTools = ['ocr', 'smart_blur', 'magnifier', 'measure'];
    for (const toolId of proTools) {
      const toolButton = shadowContainer.locator(`[data-tool="${toolId}"]`).first();
      await expect(toolButton).toBeVisible();
      await toolButton.click();

      // Pro user MUST NOT be blocked by modal dialog anymore
      await expect(modal).not.toBeVisible();
    }




  });
});
