import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Reloads the page; a token so tests can replace it. */
export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  providedIn: 'root',
  factory: () => () => location.reload(),
});

/**
 * Tells when a newer version of Lavrel has been downloaded in the background (installed app or browser), so the
 * shell can offer to reload into it. Does nothing where the service worker is off (development, tests).
 */
@Injectable({ providedIn: 'root' })
export class AppUpdates {
  private readonly updates = inject(SwUpdate);
  private readonly reloadPage = inject(RELOAD_PAGE);
  readonly ready = signal(false);

  constructor() {
    if (!this.updates.isEnabled) return;
    this.updates.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.ready.set(true));
  }

  /** Switches to the new version and reloads the page. */
  async reload(): Promise<void> {
    await this.updates.activateUpdate();
    this.reloadPage();
  }
}
