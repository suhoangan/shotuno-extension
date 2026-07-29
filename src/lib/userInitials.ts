/** Initials for avatar fallback from name or email. */
export function userInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const fromName = name?.trim();
  if (fromName) {
    const parts = fromName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
    }
    return fromName.slice(0, 2).toUpperCase();
  }
  const fromEmail = email?.trim();
  if (fromEmail) return fromEmail.slice(0, 2).toUpperCase();
  return '?';
}
