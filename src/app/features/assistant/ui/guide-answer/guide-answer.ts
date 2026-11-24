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

  /** One pill per source: the wiki's own name when the backend sends it, else the host of the page. */
  protected readonly pills = computed(() =>
    this.sources().map((s) => ({
      url: s.url,
      name: s.site?.trim() || hostOf(s.url),
      title: s.title,
      license: s.license,
    })),
  );

  /**
   * Each license once, linked to its page when the backend sends one (the credit CC BY-SA asks for: title, source,
   * license). Only http(s) links are kept, like links in answers.
   */
  protected readonly licenses = computed(() => {
    const byName = new Map<string, string | null>();
    for (const s of this.sources()) {
      const url = webLink(s.licenseUrl);
      if (!byName.has(s.license) || (!byName.get(s.license) && url)) byName.set(s.license, url);
    }
    return [...byName].map(([name, url]) => ({ name, url }));
  });
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function webLink(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}
