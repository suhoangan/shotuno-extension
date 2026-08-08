export function getMainScrollContainer(): Element | Window {
  if (typeof document === 'undefined') return window;

  const htmlStyle = window.getComputedStyle(document.documentElement);
  const bodyStyle = window.getComputedStyle(document.body);
  const htmlOverflow = htmlStyle.overflowY;
  const bodyOverflow = bodyStyle.overflowY;

  const isWindowScrollable =
    htmlOverflow !== 'hidden' &&
    bodyOverflow !== 'hidden' &&
    htmlOverflow !== 'clip' &&
    bodyOverflow !== 'clip';

  const docScrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );

  // If main document window is scrollable, always return window
  if (isWindowScrollable && docScrollHeight > window.innerHeight + 10) {
    return window;
  }

  // Fallback for Single Page Apps where body/html is hidden overflow and a container div scrolls
  let maxScrollArea = 0;
  let scrollContainer: Element | Window = window;

  const elements = document.querySelectorAll('*');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (el.scrollHeight <= el.clientHeight || el.clientHeight === 0) continue;
    if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;

    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;

    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      const scrollArea = el.scrollHeight * el.clientWidth;
      if (scrollArea > maxScrollArea) {
        maxScrollArea = scrollArea;
        scrollContainer = el;
      }
    }
  }

  return scrollContainer;
}

export function getScrollState(container: Element | Window): { x: number; y: number } {
  if (container === window) {
    return { x: window.scrollX, y: window.scrollY };
  }
  const el = container as Element;
  return { x: el.scrollLeft, y: el.scrollTop };
}

export function scrollToPosition(container: Element | Window, x: number, y: number) {
  if (container === window) {
    window.scrollTo({ left: x, top: y, behavior: 'instant' as ScrollBehavior });
  } else {
    const el = container as Element;
    el.scrollTo({ left: x, top: y, behavior: 'instant' as ScrollBehavior });
  }
}
