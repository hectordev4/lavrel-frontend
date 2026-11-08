import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthSession } from '../../../../core/auth/auth-session';
import { AuthStore } from '../../../../core/auth/auth.store';
import { MyAvatar } from '../../../../core/profile/my-avatar';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { Modal } from '../../../../shared/ui/modal/modal';
import { MyAccount } from '../../data-access/my-account';
import { AvatarPicker } from '../../ui/avatar-picker/avatar-picker';
import { PlatformsSection } from '../../ui/platforms-section/platforms-section';
import { PrivacySection } from '../../ui/privacy-section/privacy-section';

type Sheet = 'name' | 'country' | 'delete' | 'avatar' | null;

/** The Profile tab: who you are (name, player id, country, e-mail), sign out and delete the account. */
@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, AvatarPicker, Modal, PlatformsSection, PrivacySection],
  providers: [MyAccount],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  protected readonly account = inject(MyAccount);
  protected readonly me = inject(MyAvatar);
  private readonly auth = inject(AuthStore);
  private readonly session = inject(AuthSession);

  protected readonly sheet = signal<Sheet>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly copied = signal(false);
  protected readonly email = computed(() => this.account.user()?.email ?? this.auth.user()?.email ?? '');
  protected readonly initial = computed(() => (this.account.user()?.username ?? '?').charAt(0).toUpperCase());
  /** 4829103755210846 → "4829 1037 5521 0846". */
  protected readonly playerId = computed(() =>
    String(this.account.user()?.publicId ?? '').replace(/(\d{4})(?=\d)/g, '$1 '),
  );

  constructor() {
    void this.account.load();
    void this.me.ensureLoaded();
  }

  protected open(sheet: Sheet): void {
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

  protected async deleteAccount(confirmation: string): Promise<void> {
    if (confirmation.trim() !== 'DELETE') {
      this.formError.set('Type DELETE in capitals to confirm.');
      return;
    }
    await this.save(() => this.account.deleteAccount());
  }

  protected async copyId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(String(this.account.user()?.publicId ?? ''));
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard blocked: the id is still visible to copy by hand.
    }
  }

  protected signOut(): void {
    void this.session.signOut();
  }

  private async save(work: () => Promise<string | null>): Promise<void> {
    this.busy.set(true);
    const error = await work();
    this.busy.set(false);
    if (error) this.formError.set(error);
    else this.sheet.set(null);
  }
}
