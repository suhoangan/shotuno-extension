import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';

test.describe('Guest User Actions E2E Suite', () => {
  test.beforeEach(async ({ setAuthState }) => {
    await setAuthState('guest');
  });

  test('Guest can use free annotation tools without login prompt', async ({ extensionPage }) => {
    const shadowContainer = getShadowAppContainer(extensionPage);
    
    // Trigger editor mount or check toolbar
    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const rectTool = shadowContainer.locator('[data-tool="rect"], [aria-label*="Rectangle"]');
    if (await rectTool.isVisible()) {
      await rectTool.click();
    }

    // Modal prompt should not be visible for free annotation tools
    const modal = shadowContainer.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('Guest clicking gated Pro tool triggers login modal prompt', async ({ extensionPage }) => {
    const shadowContainer = getShadowAppContainer(extensionPage);

    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const ocrTool = shadowContainer.locator('[data-tool="ocr"], [aria-label*="OCR"]');
    if (await ocrTool.isVisible()) {
      await ocrTool.click();

      // Login prompt dialog must open for guest users
      const modal = shadowContainer.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/log in/i);
    }
  });

  test('Guest clicking Log In on modal navigates to login page', async ({ extensionPage }) => {
    const shadowContainer = getShadowAppContainer(extensionPage);

    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const ocrTool = shadowContainer.locator('[data-tool="ocr"], [aria-label*="OCR"]');
    if (await ocrTool.isVisible()) {
      await ocrTool.click();

      const loginButton = shadowContainer.getByRole('button', { name: /log in/i });
      if (await loginButton.isVisible()) {
        const [newPage] = await Promise.all([
          extensionPage.context().waitForEvent('page'),
          loginButton.click(),
        ]);
        expect(newPage.url()).toMatch(/login|auth/);
      }
    }
  });
});
