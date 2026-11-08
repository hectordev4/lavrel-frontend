import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AvatarApi } from '../api/avatar.api';
import { CurrentUserApi } from '../api/current-user.api';
import { ProfileAvatar } from '../api/models/profile-avatar.model';
import { AuthStore } from '../auth/auth.store';
import { avatarErrorMessage } from './avatar-messages';

/**
 * The member's own picture, shared by the header and the Profile tab: the public id (the generated
 * robot's seed), the name's initial and the chosen avatar. Changes resolve to an error message, or null.
 */
@Injectable({ providedIn: 'root' })
export class MyAvatar {
  private readonly api = inject(AvatarApi);
  private readonly currentUser = inject(CurrentUserApi);
  private readonly auth = inject(AuthStore);

  private readonly _avatar = signal<ProfileAvatar | null>(null);
  private readonly _seed = signal('');
  private readonly _initial = signal('?');
  private loading = false;

  readonly avatar = this._avatar.asReadonly();
  readonly seed = this._seed.asReadonly();
  readonly initial = this._initial.asReadonly();
  readonly loaded = computed(() => this._seed() !== '');

  constructor() {
    effect(() => {
      if (!this.auth.isVerified()) {
        this._avatar.set(null);
        this._seed.set('');
        this._initial.set('?');
        this.loading = false;
      }
    });
  }

  async ensureLoaded(): Promise<void> {
    if (this.loading || this.loaded() || !this.auth.isVerified()) return;
    this.loading = true;
    try {
      const [user, avatar] = await Promise.all([
        firstValueFrom(this.currentUser.get()),
        firstValueFrom(this.api.get()).catch(() => null),
      ]);
      this._seed.set(String(user.publicId ?? user.username ?? 'lavrel'));
      this._initial.set((user.username ?? '?').charAt(0).toUpperCase());
      this._avatar.set(avatar);
    } catch {
      // The header falls back to the initial; the Profile tab shows its own error.
    } finally {
      this.loading = false;
    }
  }

  chooseGallery(galleryId: string): Promise<string | null> {
    return this.run(async () => this._avatar.set(await firstValueFrom(this.api.chooseGallery(galleryId))));
  }

  upload(file: File): Promise<string | null> {
    return this.run(async () => this._avatar.set(await firstValueFrom(this.api.upload(file))));
  }

  useGenerated(): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.reset());
      this._avatar.set({ kind: 'GENERATED', galleryId: null, imageUrl: null });
    });
  }

  /** After a rename on the Profile tab. */
  setInitialFrom(name: string): void {
    this._initial.set(name.charAt(0).toUpperCase() || '?');
  }

  private async run(work: () => Promise<void>): Promise<string | null> {
    try {
      await work();
      return null;
    } catch (error) {
      return avatarErrorMessage(error);
    }
  }
}
