/**
 * Project and open-source external links and constants.
 * Shotuno is 100% offline-first and client-side with zero backend server dependencies.
 */

export const GITHUB_REPO_URL = 'https://github.com/suhoangan/shotuno-extension';
export const GITHUB_ISSUES_URL = 'https://github.com/suhoangan/shotuno-extension/issues';
export const DEVELOPER_PROFILE_URL = 'https://github.com/suhoangan';
export const DEVELOPER_NAME = 'Hoang An Su';
export const DEVELOPER_HANDLE = '@suhoangan';
export const PROJECT_LICENSE = 'MIT';

/** Fallback web URL resolver pointing to open source repo */
export function webUrl(_path = '/'): string {
  return GITHUB_REPO_URL;
}

/** Fallback api URL resolver (Shotuno is fully offline) */
export function apiUrl(_path = '/'): string {
  return '';
}
