import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/** A game's cover image; shows the title's initials when there is no image or it fails to load. */
@Component({
  selector: 'app-game-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-cover.html',
  styleUrl: './game-cover.scss',
})
export class GameCover {
  readonly src = input<string | null>(null);
  readonly title = input.required<string>();

  protected readonly failed = signal(false);
  protected readonly initials = computed(() =>
    this.title()
      .split(/\s+/)
      .filter((word) => /[a-z0-9]/i.test(word))
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  );
}
