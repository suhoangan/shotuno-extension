/**
 * DevTools-style "Capture full size screenshot" via CDP.
 * Same approach as Chrome's command palette / Puppeteer fullPage:
 * Page.getLayoutMetrics → Page.captureScreenshot(captureBeyondViewport + clip).
 */

export type LayoutMetrics = {
  cssContentSize?: { width: number; height: number };
  contentSize?: { width: number; height: number };
};

type CaptureResult = { data: string };

export function contentSizeFromMetrics(metrics: LayoutMetrics): { width: number; height: number } {
  const size = metrics.cssContentSize ?? metrics.contentSize;
  if (!size || !(size.width > 0) || !(size.height > 0)) {
    throw new Error('Could not measure page size for full capture');
  }
  return { width: Math.ceil(size.width), height: Math.ceil(size.height) };
}

async function detachQuietly(target: chrome.debugger.Debuggee): Promise<void> {
  try {
    await chrome.debugger.detach(target);
  } catch {
    // Already detached or never attached.
  }
}

export async function captureFullSizeScreenshot(tabId: number): Promise<string> {
  const target: chrome.debugger.Debuggee = { tabId };

  await chrome.debugger.attach(target, '1.3');
  try {
    const metrics = (await chrome.debugger.sendCommand(
      target,
      'Page.getLayoutMetrics',
    )) as LayoutMetrics;
    const { width, height } = contentSizeFromMetrics(metrics);

    const result = (await chrome.debugger.sendCommand(target, 'Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    })) as CaptureResult;

    if (!result?.data) {
      throw new Error('Full-size screenshot returned no image data');
    }
    return `data:image/png;base64,${result.data}`;
  } finally {
    await detachQuietly(target);
  }
}
