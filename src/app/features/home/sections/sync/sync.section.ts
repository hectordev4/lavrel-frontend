import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { ConnectSteamCard } from '../../../../shared/ui/connect-steam-card/connect-steam-card';
import { syncedLabel } from '../../../../shared/utils/synced-label';

/** Home: the Steam line (last synced, Sync now) or, with no Steam account yet, the Connect Steam card. */
@Component({
  selector: 'app-sync-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConnectSteamCard],
  template: `
    @if (accounts.message(); as m) {
      <p class="alert" role="alert">{{ m }}</p>
    }
    @if (accounts.steam(); as steam) {
      <div class="sync">
        <span class="muted small">Steam · {{ lastSynced() }}</span>
        <button
          type="button"
          class="btn btn-secondary sync-btn"
          [disabled]="accounts.syncing() !== null"
          (click)="syncNow()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" [class.spin]="accounts.syncing() !== null">
            <path d="M21 12a9 9 0 1 1-2.64-6.36 M21 4v5h-5" />
          </svg>
          <span>
            @if (accounts.syncing(); as p) {
              Syncing… {{ p.gamesSynced }}
            } @else {
              Sync now
            }
          </span>
        </button>
      </div>
    } @else if (accounts.loadState() === 'ready') {
      <app-connect-steam-card [busy]="accounts.linking()" (connect)="connect()" />
    } @else if (accounts.loadState() === 'error') {
      <p class="failed">
        Your Steam status didn’t load.
        <button type="button" (click)="accounts.reload()">Try again</button>
      </p>
    }
  `,
  styleUrls: ['../section.scss', './sync.section.scss'],
})
export class SyncSection {
  protected readonly accounts = inject(PlatformAccounts);
  protected readonly lastSynced = computed(() => syncedLabel(this.accounts.steam()?.lastSyncedAt));

  constructor() {
    this.accounts.ensureLoaded();
  }

  protected syncNow(): void {
    const steam = this.accounts.steam();
    if (steam) void this.accounts.sync(steam);
  }

  protected connect(): void {
    void this.accounts.connect('STEAM');
  }
}
