import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../core/auth/auth.store';
import { MyAvatar } from '../../../../core/profile/my-avatar';
import { Modal } from '../../../../shared/ui/modal/modal';
import { MyAccount } from '../../data-access/my-account';

/** Profile's Account rows (display name, country, e-mail) and the sheets to change the name and the country. */
@Component({
  selector: 'app-account-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  templateUrl: './account-section.html',
  styleUrl: './account-section.scss',
})
export class AccountSection {
  protected readonly account = inject(MyAccount);
  private readonly me = inject(MyAvatar);
  private readonly auth = inject(AuthStore);

  protected readonly sheet = signal<'name' | 'country' | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly email = computed(
    () => this.account.user()?.email ?? this.auth.user()?.email ?? '',
  );

  protected open(sheet: 'name' | 'country'): void {
    this.formError.set(null);
    this.sheet.set(sheet);
  }

  protected async saveName(name: string): Promise<void> {
    if (!name.trim()) {
      this.formError.set('Enter a name.');
      return;
    }
    await this.save(() => this.account.rename(name));
    if (!this.formError()) this.me.setInitialFrom(name.trim());
  }

  protected async saveCountry(value: string): Promise<void> {
    await this.save(() => this.account.setCountry(value ? Number(value) : null));
  }

  private async save(work: () => Promise<string | null>): Promise<void> {
    this.busy.set(true);
    const error = await work();
    this.busy.set(false);
    if (error) this.formError.set(error);
    else this.sheet.set(null);
  }
}
