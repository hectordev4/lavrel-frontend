import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** About: the game's description, folded after four lines with Read more. */
@Component({
  selector: 'app-game-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (description(); as text) {
      <section class="about">
        <h2>About</h2>
        <p class="description" [class.open]="descriptionOpen()">{{ text }}</p>
        @if (text.length > 220) {
          <button type="button" class="link-btn" (click)="descriptionOpen.set(!descriptionOpen())">
            {{ descriptionOpen() ? 'Show less' : 'Read more' }}
          </button>
        }
      </section>
    }
  `,
  styleUrl: './game-about.scss',
})
export class GameAbout {
  readonly description = input<string | null>(null);
  protected readonly descriptionOpen = signal(false);
}
