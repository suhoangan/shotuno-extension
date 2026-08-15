import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';

test.describe('Pro Logged-in User Actions E2E Suite', () => {
  test.beforeEach(async ({ setAuthState, mountEditor }) => {
    await setAuthState('pro');
    await mountEditor();
  });

  test('Pro user mounts canvas editor with fully rendered stage', async ({ extensionPage }) => {
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    const canvas = shadowContainer.locator('.konvajs-content canvas, canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('Pro user executes all Pro annotation and AI tools with live mouse canvas actions and zero modal blocks', async ({
    extensionPage,
  }) => {
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    const canvas = shadowContainer.locator('.konvajs-content canvas, canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const canvasBox = box!;

    // Pro tools to test live on canvas
    const proTools = ['ocr', 'smart_blur', 'magnifier', 'counter', 'measure'];

    for (let i = 0; i < proTools.length; i++) {
      const toolId = proTools[i];
      const toolBtn = shadowContainer.locator(`[data-tool="${toolId}"]`).first();
      await expect(toolBtn).toBeVisible();
      await toolBtn.click();

      // Perform real mouse click/drag action on canvas
      const startX = canvasBox.x + 100 + i * 40;
      const startY = canvasBox.y + 100 + i * 30;
      const endX = startX + 80;
      const endY = startY + 60;

      await extensionPage.mouse.move(startX, startY);
      await extensionPage.mouse.down();
      await extensionPage.mouse.move(endX, endY);
      await extensionPage.mouse.up();

      // Strict check: Pro users MUST NEVER see an upgrade or login dialog modal
      const modal = shadowContainer.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });
});
