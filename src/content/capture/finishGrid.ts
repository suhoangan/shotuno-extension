import { toast } from 'sonner';
import { savePinImagesBatch } from '../../lib/pinDb';
import { useHardLoadingStore } from '../../store/useHardLoadingStore';
import { hideFloatingElements, listFloatingElements } from '../components/fullPageFloatingChrome';
import { captureVisibleTab, cropVisibleCapture } from '../utils/areaCapture';
import { getMainScrollContainer, getScrollState, scrollToPosition } from '../utils/scrollUtils';
import type { GridRegion } from './types';

export async function finishGridCapture(
  regions: GridRegion[],
): Promise<'saved' | 'empty' | 'error'> {
  if (regions.length === 0) return 'empty';

  const { showHardLoading, hideHardLoading } = useHardLoadingStore.getState();
  const container = getMainScrollContainer();
  const originalScroll = getScrollState(container);

  // Disable smooth scroll during capture so jumps are instant and stable
  const htmlStyle = document.documentElement.style;
  const bodyStyle = document.body.style;
  const prevHtmlBehavior = htmlStyle.scrollBehavior;
  const prevBodyBehavior = bodyStyle.scrollBehavior;

  try {
    htmlStyle.scrollBehavior = 'auto';
    bodyStyle.scrollBehavior = 'auto';

    const batchId = `batch-${Date.now()}`;
    const croppedUrls: string[] = [];

    // Hide Grid Capture overlay backdrop and toolbar
    const backdrop = document.getElementById('grid-capture-overlay-backdrop');
    const toolbar = document.getElementById('grid-capture-toolbar');
    if (backdrop) {
      backdrop.style.setProperty('visibility', 'hidden', 'important');
      backdrop.style.setProperty('opacity', '0', 'important');
    }
    if (toolbar) {
      toolbar.style.setProperty('visibility', 'hidden', 'important');
      toolbar.style.setProperty('opacity', '0', 'important');
    }

    for (let i = 0; i < regions.length; i++) {
      const rect = regions[i];
      showHardLoading({
        title: 'Capturing grid',
        message: `Capturing region ${i + 1} of ${regions.length}`,
      });

      // Target scroll position: center region vertically in viewport with top margin
      const targetY = Math.max(0, rect.y - Math.max(20, (window.innerHeight - rect.h) / 3));
      scrollToPosition(container, originalScroll.x, targetY);

      // Temporarily hide fixed/floating header elements
      const restoreFloating = hideFloatingElements(listFloatingElements());

      // Wait 2 animation frames for layout to settle
      await new Promise((r) => setTimeout(r, 120));
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      // Temporarily hide Shotuno root container & hard loading screen during screenshot capture
      const shotunoRoot = document.getElementById('shotuno-root');
      if (shotunoRoot) {
        shotunoRoot.style.setProperty('visibility', 'hidden', 'important');
        shotunoRoot.style.setProperty('opacity', '0', 'important');
      }
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      // Get exact actual scroll state immediately before taking the screenshot
      const currentScroll = getScrollState(container);
      const dataUrl = await captureVisibleTab();

      // Immediately unhide Shotuno root & hard loading screen
      if (shotunoRoot) {
        shotunoRoot.style.removeProperty('visibility');
        shotunoRoot.style.removeProperty('opacity');
      }

      // Restore floating headers immediately after capture
      restoreFloating();

      const viewportRect = {
        x: rect.x - currentScroll.x,
        y: rect.y - currentScroll.y,
        w: rect.w,
        h: rect.h,
      };

      croppedUrls.push(await cropVisibleCapture(dataUrl, viewportRect));
    }

    if (backdrop) {
      backdrop.style.removeProperty('visibility');
      backdrop.style.removeProperty('opacity');
    }
    if (toolbar) {
      toolbar.style.removeProperty('visibility');
      toolbar.style.removeProperty('opacity');
    }

    // Restore original scroll position and behavior
    scrollToPosition(container, originalScroll.x, originalScroll.y);
    htmlStyle.scrollBehavior = prevHtmlBehavior;
    bodyStyle.scrollBehavior = prevBodyBehavior;

    if (croppedUrls.length === 0) {
      throw new Error('No regions captured');
    }

    showHardLoading({ title: 'Capturing grid', message: 'Saving images...' });
    await savePinImagesBatch(croppedUrls, batchId);
    hideHardLoading();
    toast.success(`Saved ${croppedUrls.length} regions to pins`);
    return 'saved';
  } catch (e) {
    hideHardLoading();

    const backdrop = document.getElementById('grid-capture-overlay-backdrop');
    const toolbar = document.getElementById('grid-capture-toolbar');
    const shotunoRoot = document.getElementById('shotuno-root');
    if (backdrop) {
      backdrop.style.removeProperty('visibility');
      backdrop.style.removeProperty('opacity');
    }
    if (toolbar) {
      toolbar.style.removeProperty('visibility');
      toolbar.style.removeProperty('opacity');
    }
    if (shotunoRoot) {
      shotunoRoot.style.removeProperty('visibility');
      shotunoRoot.style.removeProperty('opacity');
    }

    scrollToPosition(container, originalScroll.x, originalScroll.y);
    htmlStyle.scrollBehavior = prevHtmlBehavior;
    bodyStyle.scrollBehavior = prevBodyBehavior;

    console.error(e);
    const detail = e instanceof Error && e.message ? e.message : 'Could not save grid capture';
    toast.error(detail);
    return 'error';
  }
}
