import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MyAvatar } from '../../../../core/profile/my-avatar';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { CopyButton } from '../../../../shared/ui/copy-button/copy-button';
import { Modal } from '../../../../shared/ui/modal/modal';
import { formatPlayerId } from '../../../../shared/utils/player-id';
import { MyAccount } from '../../data-access/my-account';
import { AccountEnd } from '../../ui/account-end/account-end';
import { AccountSection } from '../../ui/account-section/account-section';
import { AvatarPicker } from '../../ui/avatar-picker/avatar-picker';
import { PlatformsSection } from '../../ui/platforms-section/platforms-section';
import { PrivacySection } from '../../ui/privacy-section/privacy-section';
import { ShelvesSection } from '../../ui/shelves-section/shelves-section';

/** The Profile tab: who you are (name, player id, country, e-mail), sign out and delete the account. */
@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Avatar,
    AvatarPicker,
    CopyButton,
    Modal,
    AccountSection,
    AccountEnd,
    PlatformsSection,
    PrivacySection,
    ShelvesSection,
  ],
  providers: [MyAccount],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  protected readonly account = inject(MyAccount);
  protected readonly me = inject(MyAvatar);
  /** The avatar sheet; the account's own sheets live in AccountSection and AccountEnd. */
  protected readonly avatarOpen = signal(false);
  protected readonly initial = computed(() =>
    (this.account.user()?.username ?? '?').charAt(0).toUpperCase(),
  );
  protected readonly playerId = computed(() => formatPlayerId(this.account.user()?.publicId));

  constructor() {
    void this.account.load();
    void this.me.ensureLoaded();
  }
}
