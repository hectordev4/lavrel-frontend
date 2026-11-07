import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccountsApi } from '../../../../core/api/accounts.api';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { Switch } from '../../../../shared/ui/switch/switch';
import { relativeTime } from '../../../../shared/utils/relative-time';

/** Linked platforms on the Profile tab: Steam connected (sync, automatic sync, unlink) or Connect Steam. */
@Component({
  selector: 'app-platforms-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Switch],
  templateUrl: './platforms-section.html',
  styleUrl: './platforms-section.scss',
})
export class PlatformsSection {
  protected readonly accounts = inject(PlatformAccounts);
  private readonly api = inject(AccountsApi);

  protected readonly autoSync = signal<boolean | null>(null);
  protected readonly autoSyncError = signal<string | null>(null);
  protected readonly lastSynced = computed(() => {
    const at = this.accounts.steam()?.lastSyncedAt;
    return at ? `Last synced ${relativeTime(at)}` : 'Not synced yet';
  });

  constructor() {
    this.accounts.ensureLoaded();
    void this.loadAutoSync();
  }

  private async loadAutoSync(): Promise<void> {
    try {
      this.autoSync.set(await firstValueFrom(this.api.autoSync()));
    } catch {
      this.autoSync.set(null);
    }
  }

  protected async setAutoSync(enabled: boolean): Promise<void> {
    const before = this.autoSync();
    this.autoSync.set(enabled);
    this.autoSyncError.set(null);
    try {
      this.autoSync.set(await firstValueFrom(this.api.setAutoSync(enabled)));
    } catch {
      this.autoSync.set(before);
      this.autoSyncError.set('That setting didn’t save. Try again in a moment.');
    }
  }

  protected syncNow(): void {
    const steam = this.accounts.steam();
    if (steam) void this.accounts.sync(steam);
  }

  protected unlink(): void {
    const steam = this.accounts.steam();
    if (!steam) return;
    const ok = confirm('Unlink Steam? Your Steam games, playtime and achievements leave your Lavrel library. You can link it again later.');
    if (ok) void this.accounts.unlink(steam);
  }

  protected connect(): void {
    void this.accounts.link('STEAM');
  }
}
