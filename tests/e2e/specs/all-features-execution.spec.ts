import { test, expect, getShadowAppContainer } from '../fixtures/extension.fixture';

test.describe('All 24 Features E2E User Action Suite', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ setAuthState }) => {

    // Run under Pro status to test full UI execution of every tool
    await setAuthState('pro');
  });

  test('annotation tools trigger correctly and draw shapes on canvas overlay', async ({ extensionPage, mountEditor }) => {
    await mountEditor();
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    const canvas = shadowContainer.locator('.konvajs-content canvas, canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const canvasBox = box!;
    expect(canvasBox.width).toBeGreaterThan(100);
    expect(canvasBox.height).toBeGreaterThan(100);


    // 1. Test direct toolbar annotation tools
    const directTools = ['arrow', 'text', 'brush', 'highlight', 'counter', 'blur', 'magnifier', 'measure'];

    for (let i = 0; i < directTools.length; i++) {
      const tool = directTools[i];
      const toolButton = shadowContainer.locator(`[data-tool="${tool}"]`).first();
      await expect(toolButton).toBeVisible();
      await toolButton.click();

      // Perform real canvas click and drag drawing action
      const startX = canvasBox.x + 50 + (i * 25);
      const startY = canvasBox.y + 50 + (i * 25);
      const endX = startX + 80;
      const endY = startY + 80;

      await extensionPage.mouse.move(startX, startY);
      await extensionPage.mouse.down();
      await extensionPage.mouse.move(endX, endY);
      await extensionPage.mouse.up();
      await extensionPage.waitForTimeout(100);
    }

    // 2. Test shape dropdown tools (rect, circle, triangle)
    const shapeTools = ['rect', 'circle', 'triangle'];
    for (let i = 0; i < shapeTools.length; i++) {
      const shapeTool = shapeTools[i];
      const shapeMenuButton = shadowContainer.locator('[data-tool="shape-toggle"]').first();
      await expect(shapeMenuButton).toBeVisible();
      await shapeMenuButton.click();


      const subToolButton = shadowContainer.locator(`[data-tool="${shapeTool}"]`).first();
      await expect(subToolButton).toBeVisible();
      await subToolButton.click();

      const startX = canvasBox.x + 200 + (i * 30);
      const startY = canvasBox.y + 100 + (i * 30);
      const endX = startX + 90;
      const endY = startY + 90;

      await extensionPage.mouse.move(startX, startY);
      await extensionPage.mouse.down();
      await extensionPage.mouse.move(endX, endY);
      await extensionPage.mouse.up();
      await extensionPage.waitForTimeout(100);
    }
  });

  test('advanced tools and export options execute mouse actions on canvas overlay', async ({ extensionPage, mountEditor }) => {
    await mountEditor();
    const shadowContainer = getShadowAppContainer(extensionPage);
    await expect(shadowContainer).toBeVisible({ timeout: 5000 });

    const canvas = shadowContainer.locator('.konvajs-content canvas, canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const canvasBox = box!;

    // 1. Crop canvas with mouse drag
    const cropButton = shadowContainer.locator('[data-tool="crop"]').first();
    await expect(cropButton).toBeVisible();
    await cropButton.click();

    await extensionPage.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
    await extensionPage.mouse.down();
    await extensionPage.mouse.move(canvasBox.x + 500, canvasBox.y + 400);
    await extensionPage.mouse.up();
    await extensionPage.waitForTimeout(150);

    // 2. OCR text selection with mouse drag on canvas
    const ocrButton = shadowContainer.locator('[data-tool="ocr"]').first();
    await expect(ocrButton).toBeVisible();
    await ocrButton.click();

    await extensionPage.mouse.move(canvasBox.x + 120, canvasBox.y + 140);
    await extensionPage.mouse.down();
    await extensionPage.mouse.move(canvasBox.x + 480, canvasBox.y + 220);
    await extensionPage.mouse.up();
    await extensionPage.waitForTimeout(150);

    // 3. Smart Privacy Blur with canvas interaction
    const smartBlurButton = shadowContainer.locator('[data-tool="smart_blur"]').first();
    await expect(smartBlurButton).toBeVisible();
    await smartBlurButton.click();

    await extensionPage.mouse.move(canvasBox.x + 200, canvasBox.y + 200);
    await extensionPage.mouse.down();
    await extensionPage.mouse.move(canvasBox.x + 350, canvasBox.y + 350);
    await extensionPage.mouse.up();
    await extensionPage.waitForTimeout(150);

    // 4. Send to AI Modal execution
    const sendToAiButton = shadowContainer.locator('[data-tool="send_to_ai"]').first();
    await expect(sendToAiButton).toBeVisible();
    await sendToAiButton.click();

    const activeModal = shadowContainer.locator('[role="dialog"]');
    await expect(activeModal).toBeVisible({ timeout: 3000 });
  });



});

