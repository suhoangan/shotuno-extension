import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dataUrlToFile,
  buildDataTransfer,
  insertEditorText,
} from '@/content/utils/aiInjectShared';

describe('AI Tools - Prompt Formatting & AI Payload Injection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal('InputEvent', class {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    });

    vi.stubGlobal('DataTransfer', class {
      items = {
        add: vi.fn(),
        length: 1,
      };
      data: Record<string, string> = {};
      setData(k: string, v: string) {
        this.data[k] = v;
      }
      getData(k: string) {
        return this.data[k];
      }
    });

    vi.stubGlobal('Event', class {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    });

    vi.stubGlobal('document', {
      querySelector: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue([]),
      createRange: () => ({
        selectNodeContents: vi.fn(),
        collapse: vi.fn(),
      }),
      execCommand: vi.fn().mockReturnValue(true),
      createElement: (tag: string) => {
        const attrs: Record<string, string> = {};
        const el: any = {
          tagName: tag.toUpperCase(),
          focus: vi.fn(),
          classList: { remove: vi.fn(), contains: vi.fn().mockReturnValue(false) },
          dispatchEvent: vi.fn(),
          getAttribute: (name: string) => attrs[name] || null,
          setAttribute: (name: string, val: string) => { attrs[name] = val; },
          closest: vi.fn().mockReturnValue(null),
          getBoundingClientRect: vi.fn().mockReturnValue({ top: 600, bottom: 650, width: 600, height: 50 }),
          value: '',
          type: '',
          accept: '',
          children: [] as any[],
          appendChild: (c: any) => { el.children.push(c); return c; },
          remove: vi.fn(),
        };
        return el;
      },
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });

    vi.stubGlobal('window', {
      innerHeight: 800,
      getSelection: () => ({
        removeAllRanges: vi.fn(),
        addRange: vi.fn(),
      }),
    });
  });

  describe('dataUrlToFile Conversion', () => {
    it('converts PNG base64 data URL to valid File object with specified filename', async () => {
      const mockBlob = new Blob(['png-bytes'], { type: 'image/png' });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue(mockBlob),
      }));

      const file = await dataUrlToFile('data:image/png;base64,mockPng', 'shotuno-capture.png');

      expect(file).toBeDefined();
      expect(file.name).toBe('shotuno-capture.png');
      expect(file.type).toBe('image/png');
    });
  });

  describe('buildDataTransfer Helper', () => {
    it('builds DataTransfer payload containing both image file and optional text prompt', () => {
      const mockFile = new File(['data'], 'test.png', { type: 'image/png' });
      const prompt = 'Please explain this screenshot error';

      const dt = buildDataTransfer(mockFile, prompt);

      expect(dt).toBeDefined();
      expect(dt.getData('text/plain')).toBe(prompt);
    });
  });

  describe('insertEditorText', () => {
    it('updates element text content and dispatches input event for reactive editors', () => {
      const element = {
        focus: vi.fn(),
        classList: { remove: vi.fn() },
        dispatchEvent: vi.fn(),
      } as unknown as HTMLElement;

      insertEditorText(element, 'Analyze this chart layout');

      expect(element.focus).toHaveBeenCalled();
      expect(element.dispatchEvent).toHaveBeenCalled();
    });

    it('supports native textarea elements by setting value and dispatching events', () => {
      const textarea = document.createElement('textarea');
      const focusSpy = vi.spyOn(textarea, 'focus');
      const dispatchSpy = vi.spyOn(textarea, 'dispatchEvent');

      insertEditorText(textarea, 'Explain this React error');

      expect(focusSpy).toHaveBeenCalled();
      expect(textarea.value).toBe('Explain this React error');
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('Dynamic Composer Detection', () => {
    it('finds composer input dynamically using semantic attributes even when selectors change', async () => {
      const { findDynamicComposer, findDynamicFileInput } = await import('@/content/utils/dynamicComposer');

      // Create a simulated AI chat container with updated DOM structure
      const container = document.createElement('div');
      container.className = 'ai-new-design-composer';

      const promptInput = document.createElement('div');
      promptInput.setAttribute('contenteditable', 'true');
      promptInput.setAttribute('role', 'textbox');
      promptInput.setAttribute('placeholder', 'Message AI assistant…');
      promptInput.getBoundingClientRect = () => ({
        top: 600,
        bottom: 650,
        left: 100,
        right: 800,
        width: 700,
        height: 50,
        x: 100,
        y: 600,
        toJSON: () => {},
      });

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      container.appendChild(promptInput);
      container.appendChild(fileInput);

      vi.mocked(document.querySelectorAll).mockImplementation((sel: string) => {
        if (sel.includes('file')) return [fileInput] as any;
        return [promptInput] as any;
      });

      const foundComposer = findDynamicComposer();
      expect(foundComposer).toBe(promptInput);

      const foundFileInput = findDynamicFileInput(foundComposer);
      expect(foundFileInput).toBe(fileInput);
    });

    it('prefers the main message composer over a sidebar search field when markup changes', async () => {
      const { findDynamicComposer } = await import('@/content/utils/dynamicComposer');

      const searchInput = document.createElement('div');
      searchInput.setAttribute('contenteditable', 'true');
      searchInput.setAttribute('aria-label', 'Search chat history');
      searchInput.getBoundingClientRect = () => ({
        top: 40,
        bottom: 72,
        left: 0,
        right: 200,
        width: 200,
        height: 32,
        x: 0,
        y: 40,
        toJSON: () => {},
      });

      const messageInput = document.createElement('div');
      messageInput.setAttribute('contenteditable', 'true');
      messageInput.setAttribute('role', 'textbox');
      messageInput.setAttribute('placeholder', 'Message ChatGPT');
      messageInput.className = 'ProseMirror';
      messageInput.getBoundingClientRect = () => ({
        top: 620,
        bottom: 680,
        left: 80,
        right: 880,
        width: 800,
        height: 60,
        x: 80,
        y: 620,
        toJSON: () => {},
      });

      vi.mocked(document.querySelectorAll).mockImplementation((sel: string) => {
        if (sel.includes('file')) return [] as any;
        return [searchInput, messageInput] as any;
      });

      expect(findDynamicComposer('chatgpt')).toBe(messageInput);
    });
  });
});
