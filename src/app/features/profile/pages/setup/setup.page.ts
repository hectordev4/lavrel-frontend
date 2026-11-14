import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FirstSetup } from '../../../../core/profile/first-setup';
import { MyAvatar } from '../../../../core/profile/my-avatar';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { Modal } from '../../../../shared/ui/modal/modal';
import { MyAccount } from '../../data-access/my-account';
import { AvatarPicker } from '../../ui/avatar-picker/avatar-picker';

/**
 * /setup: the first time a new account opens Lavrel. It shows the name, avatar and country Lavrel gave it, to
 * change now or keep: Save and continue applies what changed; Skip for now keeps the defaults (the given name,
 * the generated avatar, no country). Either way it tells the backend (PUT /api/currentuser/setup) so it isn't
 * offered again, and goes to Home.
 */
@Component({
  selector: 'app-setup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, AvatarPicker, CubeLogo, Modal],
  providers: [MyAccount],
  templateUrl: './setup.page.html',
  styleUrl: './setup.page.scss',
})
export class SetupPage {
  protected readonly account = inject(MyAccount);
  protected readonly me = inject(MyAvatar);
  private readonly firstSetup = inject(FirstSetup);
  private readonly router = inject(Router);

  protected readonly avatarOpen = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly initial = computed(() =>
    (this.account.user()?.username ?? '?').charAt(0).toUpperCase(),
  );

  constructor() {
    void this.account.load();
    void this.me.ensureLoaded();
  }

  protected async save(name: string, countryValue: string): Promise<void> {
    const user = this.account.user();
    if (!user) return;
    const newName = name.trim();
    if (!newName) {
      this.error.set('Enter a name, or skip to keep the one you were given.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    let error: string | null = null;
    if (newName !== user.username) {
      error = await this.account.rename(newName);
      if (!error) this.me.setInitialFrom(newName);
    }
    const countryId = countryValue ? Number(countryValue) : null;
    if (!error && countryId !== (user.countryId ?? null))
      error = await this.account.setCountry(countryId);
    if (error) {
      this.saving.set(false);
      this.error.set(error);
      return;
    }
    await this.finish();
  }

  /** Keeps the defaults: the given name, the generated avatar, no country. */
  protected async skip(): Promise<void> {
    await this.finish();
  }

  private async finish(): Promise<void> {
    this.saving.set(true);
    await this.firstSetup.complete();
    await this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
