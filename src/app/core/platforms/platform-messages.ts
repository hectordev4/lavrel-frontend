import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when linking or syncing fails. */
export function platformErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'profile_private') {
      return 'Your Steam game details are private. Set them to Public in Steam’s privacy settings, then sync again.';
    }
    if (code === 'platform_unavailable' || error.status === 502) return 'Steam isn’t answering right now. Try again in a few minutes.';
    if (error.status === 429) return 'Too many syncs at once. Wait a minute, then try again.';
    if (error.status === 0) return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'The sync didn’t finish. Try again in a moment.';
}

/** Reasons meaning the Steam account belongs to another Lavrel account. */
export const LINKED_ELSEWHERE_REASONS = ['account_linked_elsewhere', 'account_already_linked'];

/** The reason the Steam login came back with, in words. */
export function linkErrorMessage(reason: string | null): string {
  if (reason && LINKED_ELSEWHERE_REASONS.includes(reason)) {
    return 'This Steam account is linked to another Lavrel account. Sign in with that account to use it, or unlink it there first.';
  }
  if (reason === 'state_expired' || reason === 'invalid_state') return 'The link took too long. Start again from your profile.';
  return 'Steam didn’t confirm the link. Try again in a moment.';
}
