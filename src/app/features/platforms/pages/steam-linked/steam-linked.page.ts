import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { LINKED_ELSEWHERE_REASONS } from '../../../../core/platforms/platform-messages';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';

/**
 * syncing: linked, first sync running. done: linked and synced. sync-failed: linked, but the sync didn't finish
 * (offer Sync again, never a new login). link-failed: Steam didn't confirm (offer to connect again).
 * elsewhere: this Steam account belongs to another Lavrel account (no retry).
 */
type Phase = 'syncing' | 'done' | 'sync-failed' | 'link-failed' | 'elsewhere';

/**
 * Where Steam's login sends the browser back (/steam/linked?status=success or ?status=error&reason=…).
 * The address is cleaned right away, so reloading doesn't run the first sync again.
 */
@Component({
  selector: 'app-steam-linked-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard],
  templateUrl: './steam-linked.page.html',
  styleUrl: './steam-linked.page.scss',
})
export class SteamLinkedPage {
  protected readonly accounts = inject(PlatformAccounts);
  private readonly router = inject(Router);
  protected readonly phase = signal<Phase>('syncing');

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const status = params.get('status');
    const reason = params.get('reason');
    if (!status) {
      // Opened without a result (a reload, an old link): nothing to report here.
      void this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
    void this.handle(status === 'success', reason);
  }

  private async handle(linked: boolean, reason: string | null): Promise<void> {
    await this.accounts.reload();
    const steam = this.accounts.steam();
    // Steam may say "already linked" when it is linked to *you*: that is a success, so sync it.
    if (!linked && !steam && reason && LINKED_ELSEWHERE_REASONS.includes(reason)) {
      this.accounts.linkFailed(reason);
      this.phase.set('elsewhere');
      return;
    }
    if (!steam) {
      this.accounts.linkFailed(reason);
      this.phase.set('link-failed');
      return;
    }
    await this.syncNow();
  }

  /** Runs the sync again after it failed (for example, once game details are public). Never a new login. */
  protected async syncNow(): Promise<void> {
    const steam = this.accounts.steam();
    if (!steam) return;
    this.phase.set('syncing');
    this.phase.set((await this.accounts.sync(steam)) ? 'done' : 'sync-failed');
  }

  protected connectAgain(): void {
    void this.accounts.connect('STEAM');
  }
}
