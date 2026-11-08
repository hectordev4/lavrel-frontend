import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { ProfileAvatar } from '../../../core/api/models/profile-avatar.model';
import { pixelbotUrl } from '../../utils/avatar-art';

/**
 * A member's round picture: their upload, a gallery Pixelbot, or the Pixelbot generated from their
 * public id. Shows the initial while the robot is being drawn. Size it with width and height.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly avatar = input<ProfileAvatar | null>(null);
  /** The public id: the seed of the generated robot. */
  readonly seed = input<string>('');
  /** Shown until the picture is ready, e.g. the name's first letter. */
  readonly initial = input('?');
  /** Accessible name; empty when the name is already next to it. */
  readonly label = input('');

  protected readonly drawn = signal<string | null>(null);
  /** The robot's seed, or null for an upload. */
  private readonly robotSeed = computed(() => {
    const a = this.avatar();
    if (a?.kind === 'UPLOADED' && a.imageUrl) return null;
    if (a?.kind === 'GALLERY' && a.galleryId) return a.galleryId;
    return this.seed() || null;
  });
  protected readonly src = computed(() => {
    const a = this.avatar();
    return a?.kind === 'UPLOADED' && a.imageUrl ? a.imageUrl : this.drawn();
  });

  constructor() {
    effect(() => {
      const seed = this.robotSeed();
      this.drawn.set(null);
      if (!seed) return;
      void pixelbotUrl(seed).then((url) => {
        if (this.robotSeed() === seed) this.drawn.set(url);
      });
    });
  }
}
