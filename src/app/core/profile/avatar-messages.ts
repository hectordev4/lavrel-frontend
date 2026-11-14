import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when changing the avatar fails. */
export function avatarErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'invalid_avatar' || error.status === 413) {
      return (
        error.error?.message ??
        'That picture can’t be used. Try a JPG, PNG or GIF under the size limit.'
      );
    }
    if (code === 'avatar_storage_unavailable')
      return 'Pictures can’t be uploaded right now. Try again later.';
    if (error.status === 0)
      return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'Your avatar didn’t save. Try again in a moment.';
}
