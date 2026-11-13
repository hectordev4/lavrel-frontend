import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthSession } from '../../../../core/auth/auth-session';
import { Modal } from '../../../../shared/ui/modal/modal';
import { MyAccount } from '../../data-access/my-account';

/** The end of Profile: Sign out, and Delete account behind a sheet that asks you to type DELETE. */
@Component({
  selector: 'app-account-end',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  templateUrl: './account-end.html',
  styleUrl: './account-end.scss',
})
export class AccountEnd {
  private readonly account = inject(MyAccount);
  private readonly session = inject(AuthSession);

  protected readonly sheet = signal<'delete' | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly busy = signal(false);

  protected open(sheet: 'delete'): void {
    this.formError.set(null);
    this.sheet.set(sheet);
  }

  protected signOut(): void {
    void this.session.signOut();
  }

  protected async deleteAccount(confirmation: string): Promise<void> {
    if (confirmation.trim() !== 'DELETE') {
      this.formError.set('Type DELETE in capitals to confirm.');
      return;
    }
    this.busy.set(true);
    const error = await this.account.deleteAccount();
    this.busy.set(false);
    if (error) this.formError.set(error);
    else this.sheet.set(null);
  }
}
