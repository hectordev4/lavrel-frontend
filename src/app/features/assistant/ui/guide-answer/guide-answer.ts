import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { GuideSource } from '../../models/guide-answer.model';
import { SiteIcon } from '../site-icon/site-icon';

let nextId = 0;

/** A source as the list shows it. */
interface SourceRow {
  url: string;
  title: string;
  site: string;
  license: string;
  icon: string | null;
  letter: string;
  tone: number;
}

/**
 * An answer bubble: a Reviewed badge for curated guides, the "may be inaccurate" note when it isn't grounded,
 * the text (already safe HTML, sanitized
 * again by Angular), and its sources at the very bottom: a small button with the wikis' icons that opens the list.
 */
@Component({
  selector: 'app-guide-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteIcon],
  templateUrl: './guide-answer.html',
  styleUrl: './guide-answer.scss',
})
export class GuideAnswer {
  readonly html = input.required<string>();
  readonly grounded = input(false);
  /** Written or rewritten by an admin. */
  readonly curated = input(false);
  readonly sources = input<GuideSource[]>([]);

  /** The sources list is closed until the person opens it: a small button with the wikis' icons. */
  protected readonly open = signal(false);
  /** Ties the button to the list it opens (aria-controls). */
  protected readonly listId = `sources-${++nextId}`;

  /** One row per source: its wiki (the wiki's own name when the backend sends it, else the page's host) and page. */
  protected readonly rows = computed((): SourceRow[] =>
    this.sources().map((s) => {
      const site = s.site?.trim() || hostOf(s.url);
      return {
        url: s.url,
        title: s.title,
        site,
        license: s.license,
        icon: iconFor(s),
        letter: initial(site),
        tone: toneOf(site),
      };
    }),
  );

  /** The button's icons: each wiki once, at most three. */
  protected readonly stack = computed(() => {
    const seen = new Map<string, SourceRow>();
    for (const row of this.rows()) if (!seen.has(row.site)) seen.set(row.site, row);
    return [...seen.values()].slice(0, 3);
  });

  protected readonly count = computed(() => {
    const n = this.sources().length;
    return n === 1 ? '1 source' : `${n} sources`;
  });

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

  protected toggle(): void {
    this.open.update((o) => !o);
  }
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

/** The wiki's icon: the one the backend sends, else the site's favicon.ico; null when the url has no web host. */
function iconFor(source: GuideSource): string | null {
  const given = webLink(source.iconUrl);
  if (given) return given;
  return /^https?:\/\//i.test(source.url) ? `${new URL(source.url).origin}/favicon.ico` : null;
}

function initial(site: string): string {
  return (site.match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();
}

/** A stable number per wiki name, for its letter tile's tone. */
function toneOf(site: string): number {
  let sum = 0;
  for (const ch of site) sum = (sum * 31 + ch.charCodeAt(0)) % 997;
  return sum;
}
