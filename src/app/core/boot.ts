import { Injectable } from '@angular/core';

/**
 * Remembers when the splash screen (which plays the logo build) ended, so the page shown
 * right after it doesn't build the logo a second time.
 */
@Injectable({ providedIn: 'root' })
export class AppBoot {
  private splashEndedAt = 0;

  markSplashEnded(): void {
    this.splashEndedAt = Date.now();
  }

  /** True only for a page opened straight after the splash. */
  cameFromSplash(): boolean {
    return Date.now() - this.splashEndedAt < 1000;
  }
}
