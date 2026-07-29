import { useEffect, useState } from 'react';

/** Load a data-URL / http image for Konva watermark overlay. */
export function useHtmlImage(url: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    let cancelled = false;
    const el = new window.Image();
    el.onload = () => { if (!cancelled) setImg(el); };
    el.onerror = () => { if (!cancelled) setImg(null); };
    el.src = url;
    return () => {
      cancelled = true;
      el.onload = null;
      el.onerror = null;
      el.src = '';
    };
  }, [url]);
  return img;
}
