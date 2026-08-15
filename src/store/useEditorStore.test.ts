import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from './useEditorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('should initialize with select tool', () => {
    const state = useEditorStore.getState();
    expect(state.activeTool).toBe('select');
  });

  it('should update activeTool when setActiveTool is called', () => {
    const { setActiveTool } = useEditorStore.getState();
    
    setActiveTool('rect');
    
    const state = useEditorStore.getState();
    expect(state.activeTool).toBe('rect');
  });

  it('should restore tool settings when setting active tool', () => {
    const { setActiveTool } = useEditorStore.getState();
    
    setActiveTool('highlight');
    
    const state = useEditorStore.getState();
    expect(state.activeTool).toBe('highlight');
    // highlight default color is #facc15 based on editorDefaults
    expect(state.selectedColor).toBe('#facc15');
    // highlight default stroke width is 8
    expect(state.strokeWidth).toBe(8);
  });
});
