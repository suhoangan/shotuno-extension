export function calculateWheelScroll(e: React.WheelEvent) {
  let dy = e.deltaY;
  let dx = e.deltaX;

  const multipliers: Record<number, { y: number; x: number }> = {
    0: { y: 2.2, x: 2.2 },
    1: { y: 60, x: 60 },
    2: { y: window.innerHeight, x: window.innerWidth },
  };

  const mult = multipliers[e.deltaMode];
  if (mult) {
    dy *= mult.y;
    dx *= mult.x;
  }

  return { dx, dy };
}

export function performScrollStep(
  clientY: number,
  container: Element | Window | null,
  onScrollUpdated: () => void
) {
  const scrollMargin = 150;
  let scrollAmount = 0;

  if (clientY < scrollMargin) {
    const ratio = (scrollMargin - clientY) / scrollMargin;
    scrollAmount = -Math.round(30 + ratio * ratio * 240);
  } else if (clientY > window.innerHeight - scrollMargin) {
    const ratio = (clientY - (window.innerHeight - scrollMargin)) / scrollMargin;
    scrollAmount = Math.round(30 + ratio * ratio * 240);
  }

  if (scrollAmount === 0) return;

  const target = container || window;
  if (target === window) {
    window.scrollBy(0, scrollAmount);
  } else {
    (target as Element).scrollTop += scrollAmount;
  }
  onScrollUpdated();
}
