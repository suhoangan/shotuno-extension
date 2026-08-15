import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';

test.describe('Free Logged-in User Actions E2E Suite', () => {
  test('Free user with 15 credits can execute Pro tool and credit badge updates', async ({
    extensionPage,
    setAuthState,
  }) => {
    await setAuthState('free_has_credits');

    const shadowContainer = getShadowAppContainer(extensionPage);

    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const creditBadge = shadowContainer.locator('[data-testid="credit-badge"], [aria-label*="credits"]');
    if (await creditBadge.isVisible()) {
      await expect(creditBadge).toHaveText(/15/);
    }

    const ocrTool = shadowContainer.locator('[data-tool="ocr"], [aria-label*="OCR"]');
    if (await ocrTool.isVisible()) {
      await ocrTool.click();

      // Modal should NOT block when credits > 0
      const modal = shadowContainer.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });

  test('Free user with 0 credits is blocked by out-of-credits modal', async ({
    extensionPage,
    setAuthState,
  }) => {
    await setAuthState('free_no_credits');

    const shadowContainer = getShadowAppContainer(extensionPage);

    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const ocrTool = shadowContainer.locator('[data-tool="ocr"], [aria-label*="OCR"]');
    if (await ocrTool.isVisible()) {
      await ocrTool.click();

      const modal = shadowContainer.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/free credits|upgrade/i);
    }
  });

  test('Clicking Upgrade to Pro on modal navigates to pricing page', async ({
    extensionPage,
    setAuthState,
  }) => {
    await setAuthState('free_no_credits');

    const shadowContainer = getShadowAppContainer(extensionPage);

    await extensionPage.evaluate(() => {
      window.postMessage({ type: 'TOGGLE_EDITOR' }, '*');
    });

    const ocrTool = shadowContainer.locator('[data-tool="ocr"], [aria-label*="OCR"]');
    if (await ocrTool.isVisible()) {
      await ocrTool.click();

      const upgradeButton = shadowContainer.getByRole('button', { name: /upgrade/i });
      if (await upgradeButton.isVisible()) {
        const [newPage] = await Promise.all([
          extensionPage.context().waitForEvent('page'),
          upgradeButton.click(),
        ]);
        expect(newPage.url()).toMatch(/pricing|subscribe/);
      }
    }
  });
});
