/** Open the in-page Shotuno editor with a data URL (injects content script if needed). */
export async function openEditorWithDataUrl(dataUrl: string): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    throw new Error('Chrome extension environment not detected');
  }
  const response = await new Promise<{ success?: boolean; error?: string }>((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'OPEN_EDITOR', payload: { dataUrl } }, (res) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve((res as { success?: boolean; error?: string }) || {});
    });
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Could not open editor');
  }
}
