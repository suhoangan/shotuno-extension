import type { RectShape } from '../../store/editorTypes';

const SENSITIVE_PATTERNS = [
  // Email
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  // Phone numbers (e.g. +1-800-555-1234, (555) 123-4567, 0987654321, O396059814)
  /\b(?:\+?\d{1,3}[-.\s]?)?\(?[O0o\d]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/gi,
  // Credit Cards (continuous digits or separated by spaces/dashes)
  /\b(?:\d[ -]*?){13,19}\b/g,
  // AWS Keys
  /\b(AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{12,}\b/g,
  // GitHub Tokens
  /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/g,
  // Stripe Keys
  /\b(sk|pk)_(test|live)_[0-9a-zA-Z]{24}\b/g,
  // Google OAuth Client IDs
  /\b[0-9a-zA-Z-]+\.apps\.googleusercontent\.com\b/g,
  // Generic High Entropy (32+ alphanumeric, e.g. md5/sha/API keys)
  /\b[A-Za-z0-9]{32,}\b/g,
  // Private Keys (RSA/EC)
  /BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY/g
];

const SENSITIVE_KEYWORDS = [
  'password',
  'pass',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apikey',
  'auth',
  'credential',
  'ssn'
];

export async function detectSensitiveAreas(
  image: HTMLImageElement,
  blurType: 'pixelate' | 'blur' | 'solid'
): Promise<RectShape[]> {
  // Use a temporary canvas to get the full image dataurl
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(image, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');

  // Dynamic import keeps tesseract out of the editor shell chunk.
  const { default: Tesseract } = await import('tesseract.js');
  const worker = await Tesseract.createWorker('eng');
  const result = await worker.recognize(dataUrl, undefined, { blocks: true });
  await worker.terminate();
  
  const shapes: RectShape[] = [];
  
  const data = result.data as any;
  const words: any[] = [];
  if (data.blocks) {
    for (const block of data.blocks) {
      if (!block.paragraphs) continue;
      for (const paragraph of block.paragraphs) {
        if (!paragraph.lines) continue;
        for (const line of paragraph.lines) {
          if (!line.words) continue;
          words.push(...line.words);
        }
      }
    }
  }

  let fullText = "";
  const indexToWord: any[] = [];
  
  for (const word of words) {
    const start = fullText.length;
    fullText += word.text + " ";
    for (let i = start; i < fullText.length; i++) {
      indexToWord[i] = word;
    }
  }

  const wordsToBlur = new Set<any>();

  // 1. Match regex patterns against the FULL text (handles spaces within tokens)
  for (const pattern of SENSITIVE_PATTERNS) {
    // Ensure regex has 'g' flag for matchAll
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
    const globalPattern = new RegExp(pattern.source, flags);
    
    for (const match of fullText.matchAll(globalPattern)) {
      if (match.index !== undefined) {
        for (let i = match.index; i < match.index + match[0].length; i++) {
          if (indexToWord[i]) wordsToBlur.add(indexToWord[i]);
        }
      }
    }
  }

  // 2. Keyword context check (e.g. "password: my_secret_here")
  for (let i = 0; i < words.length; i++) {
    if (i > 0 && !wordsToBlur.has(words[i])) {
      const prevWord = words[i - 1].text.toLowerCase().replace(/[^a-z_]/g, '');
      if (SENSITIVE_KEYWORDS.includes(prevWord)) {
        wordsToBlur.add(words[i]);
      }
    }
  }

  // Convert Set to shapes array
  for (const word of wordsToBlur) {
    const bbox = word.bbox;
    shapes.push({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: 'blur',
      x: bbox.x0,
      y: bbox.y0,
      width: bbox.x1 - bbox.x0,
      height: bbox.y1 - bbox.y0,
      color: 'transparent',
      strokeWidth: 0,
      blurType: blurType
    });
  }

  return shapes;
}
