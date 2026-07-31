/** Fixed/sticky UI that would otherwise stamp onto every scroll-stitch slice. */

export function listFloatingElements(): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (root: Document | ShadowRoot) => {
    for (const node of root.querySelectorAll('*')) {
      if (!(node instanceof HTMLElement)) continue;
      if (isShotunoCaptureUi(node)) continue;
      const position = getComputedStyle(node).position;
      if (position === 'fixed' || position === 'sticky') out.push(node);
      if (node.shadowRoot) walk(node.shadowRoot);
    }
  };
  walk(document);
  return out;
}

export function isShotunoCaptureUi(el: HTMLElement): boolean {
  if (el.id === 'full-page-capture-overlay' || el.id === 'shotuno-hard-loading') return true;
  return Boolean(el.closest('#shotuno-root'));
}

type VisibilityBackup = {
  el: HTMLElement;
  value: string;
  priority: string;
};

/** Hide floating chrome so later slices don't re-capture headers/footers. */
export function hideFloatingElements(els: HTMLElement[]): () => void {
  const backups: VisibilityBackup[] = els.map((el) => {
    const value = el.style.getPropertyValue('visibility');
    const priority = el.style.getPropertyPriority('visibility');
    el.style.setProperty('visibility', 'hidden', 'important');
    return { el, value, priority };
  });

  return () => {
    for (const backup of backups) {
      if (backup.value) {
        backup.el.style.setProperty('visibility', backup.value, backup.priority);
      } else {
        backup.el.style.removeProperty('visibility');
      }
    }
  };
}
