import { toast } from 'sonner';
import { apiClient, webUrl } from './api';

export async function uploadAndShareCloudLink(dataUrlOrBlob: string | Blob): Promise<{ url: string; id: string }> {
  let blob: Blob;

  if (typeof dataUrlOrBlob === 'string') {
    const res = await fetch(dataUrlOrBlob);
    blob = await res.blob();
  } else {
    blob = dataUrlOrBlob;
  }

  const formData = new FormData();
  formData.append('file', blob, 'screenshot.webp');

  const json = await apiClient.post<any, { id: string; url?: string }>('/screenshots/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const shortId = json.id;
  const publicShareUrl = webUrl(`/s/${shortId}`);

  try {
    await navigator.clipboard.writeText(publicShareUrl);
    toast.success('Cloud link copied to clipboard!');
  } catch {
    toast.success(`Share link ready: ${publicShareUrl}`);
  }

  return { url: publicShareUrl, id: shortId };
}
