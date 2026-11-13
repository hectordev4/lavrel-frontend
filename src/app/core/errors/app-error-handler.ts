import { ErrorHandler, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/** One unexpected error, with where it happened. */
export interface AppError {
  message: string;
  url: string;
  at: string;
}

/** Errors kept in memory, newest last (enough to see what failed, never growing without end). */
const KEPT = 20;

/**
 * Every error nobody caught ends here (with provideBrowserGlobalErrorListeners, also unhandled promise rejections).
 * It records the message and the address it happened on, logs it once with that context, and keeps the latest
 * ones in `errors` for a future "report a problem" screen. Errors already handled (HTTP failures a section shows
 * as "didn't load") never reach it.
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);
  private readonly _errors = signal<AppError[]>([]);
  readonly errors = this._errors.asReadonly();

  handleError(error: unknown): void {
    const entry: AppError = { message: messageOf(error), url: this.router.url, at: new Date().toISOString() };
    const last = this._errors().at(-1);
    // The same error repeating (for example in a loop) is logged once.
    if (last && last.message === entry.message && last.url === entry.url) return;
    this._errors.update((all) => [...all, entry].slice(-KEPT));
    console.error(`[Lavrel] Unexpected error on ${entry.url}:`, error);
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}
