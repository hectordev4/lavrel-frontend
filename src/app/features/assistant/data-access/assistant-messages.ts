import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when the assistant can't answer. */
export function assistantErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'assistant_quota_exceeded') return 'You’ve used today’s guides. New ones refill tomorrow; saved guides still open.';
    if (code === 'assistant_unavailable') return 'The guide assistant is resting right now. Try again in a little while.';
    if (error.status === 400) return error.error?.message ?? 'That question can’t be sent. Try shorter wording.';
    if (error.status === 429) return 'Too many questions at once. Wait a few seconds, then try again.';
    if (error.status === 0) return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'The assistant couldn’t answer this time. Try again in a moment.';
}
