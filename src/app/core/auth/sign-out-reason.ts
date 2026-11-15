/**
 * Why the app ended a session on its own. The reason travels to welcome as `?reason=…`, where the page shows
 * the matching text in its alert spot.
 * - session_expired: Firebase couldn't renew the session (password changed elsewhere, account disabled or
 *   deleted), so no fresh token could be had.
 * - signed_out: the API still rejected the session (401) with a fresh token.
 */
export type SignOutReason = 'session_expired' | 'signed_out';

const MESSAGES: Record<SignOutReason, string> = {
  session_expired: 'Your session has expired. Please sign in again.',
  signed_out: 'You’ve been signed out. Please sign in again.',
};

/** The text for a reason from the URL. Anyone can edit the URL, so unknown values show nothing. */
export function signOutMessage(reason: string | null | undefined): string | null {
  return reason && Object.hasOwn(MESSAGES, reason) ? MESSAGES[reason as SignOutReason] : null;
}
