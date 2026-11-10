import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GuideSource } from '../../models/guide-answer.model';

/**
 * An answer bubble: a Reviewed badge for curated guides, the "may be inaccurate" note when it isn't grounded,
 * the text (already safe HTML, sanitized
 * again by Angular), and its sources at the very bottom as rounded pills.
 */
@Component({
  selector: 'app-guide-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guide-answer.html',
  styleUrl: './guide-answer.scss',
})
export class GuideAnswer {
  readonly html = input.required<string>();
  readonly grounded = input(false);
  /** Written or rewritten by an admin. */
  readonly curated = input(false);
  readonly sources = input<GuideSource[]>([]);

  protected readonly licenses = computed(() => [...new Set(this.sources().map((s) => s.license))].join(', '));

  protected site(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}
