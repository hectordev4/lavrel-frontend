import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * A wiki's small round icon in the sources list. Loads the icon straight from the wiki (no third party in between,
 * no referrer sent); when there is none or it fails, a letter tile with the wiki's initial takes its place.
 */
@Component({
  selector: 'app-site-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-icon.html',
  styleUrl: './site-icon.scss',
})
export class SiteIcon {
  readonly src = input<string | null>(null);
  readonly letter = input.required<string>();

  private readonly failed = signal<string | null>(null);
  protected readonly showImage = computed(() => !!this.src() && this.failed() !== this.src());
  /** One of four muted tones, the same for every page of a wiki, so stacked tiles stay apart. */
  readonly tone = input(0);

  protected onError(): void {
    this.failed.set(this.src());
  }
}
