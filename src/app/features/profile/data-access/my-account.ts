import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurrentUserApi } from '../../../core/api/current-user.api';
import { AuthSession } from '../../../core/auth/auth-session';
import { AccountState } from '../models/account-state.model';
import { Country } from '../models/country.model';
import { AccountApi } from './account.api';
import { accountErrorMessage } from './account-messages';

/** The profile page's account data and changes. Actions resolve to an error message, or null. Provided by the page. */
@Injectable()
export class MyAccount {
  private readonly currentUser = inject(CurrentUserApi);
  private readonly api = inject(AccountApi);
  private readonly session = inject(AuthSession);

  readonly state = signal<AccountState>({ kind: 'loading' });
  readonly countries = signal<Country[]>([]);
  readonly user = computed(() => {
    const s = this.state();
    return s.kind === 'ready' ? s.user : null;
  });
  readonly country = computed(() => {
    const id = this.user()?.countryId;
    return id ? (this.countries().find((c) => c.id === id) ?? null) : null;
  });

  async load(): Promise<void> {
    this.state.set({ kind: 'loading' });
    try {
      const [user, countries] = await Promise.all([
        firstValueFrom(this.currentUser.get()),
        firstValueFrom(this.api.countries()).catch(() => [] as Country[]),
      ]);
      this.countries.set(countries);
      this.state.set({ kind: 'ready', user });
    } catch {
      this.state.set({ kind: 'error' });
    }
  }

  rename(username: string): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.setUsername(username.trim()));
      this.patchUser({ username: username.trim() });
    });
  }

  setCountry(countryId: number | null): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.setCountry(countryId));
      this.patchUser({ countryId });
    });
  }

  /** Deletes the account on the backend, then signs out. */
  deleteAccount(): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.deleteAccount());
      await this.session.signOut();
    });
  }

  private patchUser(change: object): void {
    const s = this.state();
    if (s.kind === 'ready') this.state.set({ kind: 'ready', user: { ...s.user, ...change } });
  }

  private async run(work: () => Promise<void>): Promise<string | null> {
    try {
      await work();
      return null;
    } catch (error) {
      return accountErrorMessage(error);
    }
  }
}
