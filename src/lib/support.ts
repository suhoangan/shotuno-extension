import { webUrl } from './api';

export const SUPPORT_HASH = '/#buy-me-a-coffee';

export function supportPageUrl() {
  return webUrl(SUPPORT_HASH);
}

export function openSupportPage() {
  window.open(supportPageUrl(), '_blank');
}
