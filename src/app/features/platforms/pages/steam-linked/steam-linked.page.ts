import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';

type Phase = 'syncing' | 'done' | 'failed';

/**
 * Where Steam's login sends the browser back (/steam/linked?status=success or ?status=error&reason=…).
 * On success it runs the first sync right away.
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
  protected readonly phase = signal<Phase>('syncing');

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    if (params.get('status') === 'success') {
      void this.firstSync();
    } else {
      this.accounts.linkFailed(params.get('reason'));
      this.phase.set('failed');
    }
  }

  private async firstSync(): Promise<void> {
    await this.accounts.reload();
    const steam = this.accounts.steam();
    const ok = steam ? await this.accounts.sync(steam) : false;
    this.phase.set(ok ? 'done' : 'failed');
  }

  protected tryAgain(): void {
    void this.accounts.link('STEAM');
  }
}
