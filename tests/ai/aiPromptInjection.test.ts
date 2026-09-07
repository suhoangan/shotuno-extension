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

    vi.stubGlobal('document', {
      querySelector: vi.fn(),
      createRange: () => ({
        selectNodeContents: vi.fn(),
        collapse: vi.fn(),
      }),
      execCommand: vi.fn().mockReturnValue(true),
    });

    vi.stubGlobal('window', {
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
  });
});
