const KNOWN_SELECTORS: Record<string, string[]> = {
  chatgpt: [
    '#prompt-textarea',
    'div.ProseMirror#prompt-textarea',
    'div.ProseMirror[contenteditable="true"]',
    'div[contenteditable="true"][role="textbox"]',
    'textarea[data-id="root"]',
    'form textarea',
  ],
  claude: [
    '[data-testid="chat-input"]',
    'div.ProseMirror[contenteditable="true"]',
    'div[aria-label*="Claude" i][contenteditable="true"]',
    'div[role="textbox"][contenteditable="true"]',
    'div.ProseMirror',
  ],
  gemini: [
    '.ql-editor[contenteditable="true"]',
    'rich-textarea .ql-editor',
    'rich-textarea [contenteditable="true"]',
    '[data-node-type="input-area"] [contenteditable="true"]',
    '[data-node-type="input-area"] textarea',
    '.ql-editor',
  ],
};

const COMPOSER_CANDIDATE_SELECTOR =
  '[contenteditable="true"], [contenteditable=""], textarea:not([readonly]), [role="textbox"]';

function isElementVisible(el: HTMLElement): boolean {
  if (el.isConnected === false) return false;
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
  }
  if (typeof el.getBoundingClientRect === 'function') {
    const rect = el.getBoundingClientRect();
    return rect.width > 20 && rect.height > 15;
  }
  return true;
}

function isNestedComposerCandidate(el: HTMLElement): boolean {
  const parent = el.parentElement?.closest(
    '[contenteditable="true"], [contenteditable=""], textarea, [role="textbox"]',
  );
  return parent != null && parent !== el;
}

function walkDeep(root: ParentNode, onElement: (el: Element) => void): void {
  const visit = (node: ParentNode) => {
    for (const child of node.children) {
      onElement(child);
      if (child.shadowRoot) visit(child.shadowRoot);
      visit(child);
    }
  };

  if (root instanceof Document) {
    if (root.documentElement) visit(root.documentElement);
    return;
  }
  visit(root);
}

function isHtmlElement(el: Element): el is HTMLElement {
  if (typeof HTMLElement !== 'undefined') return el instanceof HTMLElement;
  return 'tagName' in el;
}

function considerComposerCandidate(el: Element, seen: Set<HTMLElement>): void {
  if (!isHtmlElement(el)) return;
  if (isNestedComposerCandidate(el)) return;

  if (typeof el.matches !== 'function') {
    const contentEditable = el.getAttribute?.('contenteditable');
    if (
      (contentEditable != null && contentEditable !== 'false') ||
      el.getAttribute?.('role') === 'textbox' ||
      el.tagName === 'TEXTAREA'
    ) {
      seen.add(el);
    }
    return;
  }

  try {
    const editable =
      el.isContentEditable && el.getAttribute('contenteditable') !== 'false';
    if (el.matches(COMPOSER_CANDIDATE_SELECTOR) || editable) {
      seen.add(el);
    }
  } catch {
    /* selector unsupported on this node */
  }
}

/** Collects prompt inputs from the light DOM and open shadow roots. */
function collectComposerCandidates(): HTMLElement[] {
  const seen = new Set<HTMLElement>();

  if (typeof HTMLElement !== 'undefined' && document.documentElement) {
    walkDeep(document, (el) => considerComposerCandidate(el, seen));
  } else if (typeof document.querySelectorAll === 'function') {
    for (const el of document.querySelectorAll<HTMLElement>(COMPOSER_CANDIDATE_SELECTOR)) {
      if (isHtmlElement(el)) seen.add(el);
    }
  }

  return Array.from(seen);
}

function calculateComposerScore(el: HTMLElement, provider?: string): number {
  let score = 0;

  if (provider && KNOWN_SELECTORS[provider] && typeof el.matches === 'function') {
    for (const sel of KNOWN_SELECTORS[provider]) {
      if (el.matches(sel)) {
        score += 60;
        break;
      }
    }
  }

  if (typeof el.closest === 'function' && el.closest('header, nav, aside')) score -= 50;

  const textAttrs = [
    (typeof el.getAttribute === 'function' ? el.getAttribute('placeholder') : '') || '',
    (typeof el.getAttribute === 'function' ? el.getAttribute('aria-label') : '') || '',
    (typeof el.getAttribute === 'function' ? el.getAttribute('data-placeholder') : '') || '',
    (typeof el.getAttribute === 'function' ? el.getAttribute('title') : '') || '',
    (typeof el.getAttribute === 'function' ? el.getAttribute('name') : '') || '',
    el.id || '',
    el.className || '',
  ]
    .join(' ')
    .toLowerCase();

  if (/(search chat|search history|find chat|filter|search conversation)/i.test(textAttrs)) {
    return -100;
  }

  if (/(prompt|message|chat|ask|reply|send|tell|type|hỏi|nhập|pregunta|frage)/i.test(textAttrs)) {
    score += 35;
  }

  if (typeof el.getBoundingClientRect === 'function') {
    const rect = el.getBoundingClientRect();
    const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
    if (rect.top > vh * 0.35) score += 25;
    if (rect.top > vh * 0.6) score += 25;
  }

  if (typeof el.closest === 'function') {
    if (el.closest('form')) score += 25;
    if (el.closest('footer')) score += 25;
    if (
      el.closest(
        '[class*="composer" i], [class*="chat" i], [data-testid*="composer" i], [data-node-type="input-area"]',
      )
    ) {
      score += 30;
    }
  }

  if (el.isContentEditable) score += 20;
  if (
    el.tagName === 'TEXTAREA' ||
    (typeof HTMLTextAreaElement !== 'undefined' && el instanceof HTMLTextAreaElement)
  ) {
    score += 20;
  }
  if (el.classList?.contains?.('ProseMirror') || el.classList?.contains?.('ql-editor')) score += 30;
  if (typeof document !== 'undefined' && document.activeElement === el) score += 15;

  return score;
}

/** Dynamically searches for the best matching AI chat prompt input in the DOM. */
export function findDynamicComposer(provider?: string): HTMLElement | null {
  const candidates = collectComposerCandidates();

  let bestEl: HTMLElement | null = null;
  let highestScore = 25;

  for (const el of candidates) {
    if (!isElementVisible(el)) continue;
    const score = calculateComposerScore(el, provider);
    if (score > highestScore) {
      highestScore = score;
      bestEl = el;
    }
  }

  return bestEl;
}

/** Waits for an AI prompt input to appear in DOM via dynamic heuristics and observer. */
export function waitForDynamicComposer(
  options: { provider?: string; timeoutMs?: number } = {},
): Promise<HTMLElement> {
  const { provider, timeoutMs = 15000 } = options;

  return new Promise((resolve, reject) => {
    const existing = findDynamicComposer(provider);
    if (existing) return resolve(existing);

    let resolved = false;

    const cleanup = () => {
      resolved = true;
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timer);
    };

    const check = () => {
      if (resolved) return;
      const el = findDynamicComposer(provider);
      if (el) {
        cleanup();
        resolve(el);
      }
    };

    const observer = new MutationObserver(check);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }

    const interval = setInterval(check, 300);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Dynamic composer input not found for provider: ${provider || 'unknown'}`));
    }, timeoutMs);
  });
}

function collectFileInputsNear(composerEl: HTMLElement): HTMLInputElement[] {
  const scope =
    composerEl.closest('form') ||
    composerEl.closest('[class*="composer" i], [data-node-type="input-area"]') ||
    composerEl.parentElement;
  if (!scope) return [];

  const found: HTMLInputElement[] = [];
  walkDeep(scope, (el) => {
    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file') found.push(el as HTMLInputElement);
  });
  return found;
}

function collectAllFileInputs(): HTMLInputElement[] {
  const found: HTMLInputElement[] = [];
  if (typeof HTMLElement !== 'undefined' && document.documentElement) {
    walkDeep(document, (el) => {
      if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file') found.push(el as HTMLInputElement);
    });
  } else if (typeof document.querySelectorAll === 'function') {
    found.push(...document.querySelectorAll<HTMLInputElement>('input[type="file"]'));
  }
  return found;
}

/** Dynamically locates the file upload input element for image attachments. */
export function findDynamicFileInput(composerEl?: HTMLElement | null): HTMLInputElement | null {
  const near = composerEl ? collectFileInputsNear(composerEl) : [];
  const pool = near.length > 0 ? near : collectAllFileInputs();

  const imageInputs = pool.filter((input) => {
    const accept = (input.accept || '').toLowerCase();
    return !accept || accept.includes('image') || accept.includes('png') || accept.includes('*');
  });

  return imageInputs[0] || pool[0] || null;
}
