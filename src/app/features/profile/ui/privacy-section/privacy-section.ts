import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Switch } from '../../../../shared/ui/switch/switch';
import { PrivacyApi } from '../../data-access/privacy.api';
import { ProfileSettings } from '../../models/profile-settings.model';

type Key = keyof ProfileSettings;

/** The public profile switches. Each change saves at once and goes back if the save fails. */
@Component({
  selector: 'app-privacy-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Switch],
  templateUrl: './privacy-section.html',
  styleUrl: './privacy-section.scss',
})
export class PrivacySection {
  private readonly api = inject(PrivacyApi);

  protected readonly settings = signal<ProfileSettings | null>(null);
  protected readonly failed = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly saving = signal(false);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failed.set(false);
    try {
      this.settings.set(await firstValueFrom(this.api.get()));
    } catch {
      this.failed.set(true);
    }
  }

  protected async set(key: Key, value: boolean): Promise<void> {
    const before = this.settings();
    if (!before) return;
    this.message.set(null);
    this.settings.set({ ...before, [key]: value });
    this.saving.set(true);
    try {
      const saved = await firstValueFrom(this.api.update({ [key]: value }));
      this.settings.set({ ...before, ...saved });
    } catch {
      this.settings.set(before);
      this.message.set('That setting didn’t save. Try again in a moment.');
    } finally {
      this.saving.set(false);
    }
  }
}
