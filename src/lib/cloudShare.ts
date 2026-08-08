import { toast } from 'sonner';
import { apiUrl, webUrl } from './api';
import { storage } from '../lib/chromeStorage';


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

  const authData = await new Promise<{ authToken?: string }>((resolve) => {
    storage.local.get(['authToken'], (res) => resolve(res));
  });

  const headers: Record<string, string> = {};
  if (authData.authToken) {
    headers['Authorization'] = `Bearer ${authData.authToken}`;
  }

  const uploadRes = await fetch(apiUrl('/screenshots/upload'), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!uploadRes.ok) {
    const errJson = (await uploadRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(errJson.message || `Upload failed (HTTP ${uploadRes.status})`);
  }

  const json = (await uploadRes.json()) as { id: string; url?: string };
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
