import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { GameSort } from '../../../../core/api/models/game-sort.model';
import { TrackingStatus } from '../../../../core/api/models/tracking-status.model';
import { AuthStore } from '../../../../core/auth/auth.store';
import { TrackedGames } from '../../../../core/tracking/tracked-games';
import { Chip } from '../../../../shared/ui/chip/chip';
import { FiltersPage } from '../filters/filters.page';
import { TrackControl } from '../../../../shared/ui/track-control/track-control';
import {
  MODE_LABELS,
  SORT_LABELS,
  SYSTEM_LABELS,
  isGameSort,
} from '../../data-access/search-labels';
import {
  activeFilterCount,
  emptyFilters,
  parseFilters,
  toQueryParams,
} from '../../data-access/search-query';
import { SearchResults } from '../../data-access/search-results';
import { SearchFilters } from '../../models/search-filters.model';
import { ResultCard } from '../../ui/result-card/result-card';
import { SelectField } from '../../../../shared/ui/select-field/select-field';

/** One removable chip for an active filter. */
interface ActiveChip {
  key: string;
  label: string;
  without: SearchFilters;
}

/** Full search results: filter chips, sort, the list and "Show more". Everything lives in the address. */
@Component({
  selector: 'app-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FiltersPage, SelectField, RouterLink, Chip, ResultCard, TrackControl],
  providers: [SearchResults],
  templateUrl: './results.page.html',
  styleUrl: './results.page.scss',
})
export class ResultsPage {
  private readonly router = inject(Router);
  protected readonly results = inject(SearchResults);
  protected readonly tracked = inject(TrackedGames);
  protected readonly signedIn = inject(AuthStore).isVerified;
  protected readonly trackMessage = signal<string | null>(null);
  protected readonly filters = signal<SearchFilters>(emptyFilters());

  protected readonly filterCount = computed(() => activeFilterCount(this.filters()));
  protected readonly queryParams = computed(() => toQueryParams(this.filters()));
  protected readonly sort = computed<GameSort>(
    () => this.filters().sort ?? (this.filters().q ? 'relevance' : 'popular'),
  );
  protected readonly sortOptions = computed(() =>
    (Object.keys(SORT_LABELS) as GameSort[])
      .filter((s) => s !== 'relevance' || this.filters().q)
      .map((value) => ({ value, label: SORT_LABELS[value] })),
  );
  protected readonly chips = computed<ActiveChip[]>(() => chipsFor(this.filters()));

  constructor() {
    this.tracked.ensureLoaded();
    inject(ActivatedRoute)
      .queryParamMap.pipe(map(parseFilters), takeUntilDestroyed())
      .subscribe((filters) => {
        this.filters.set(filters);
        this.results.load(filters);
      });
  }

  protected apply(filters: SearchFilters): void {
    void this.router.navigate([], { queryParams: toQueryParams(filters) });
  }

  protected async track(gameId: number, status: TrackingStatus): Promise<void> {
    this.trackMessage.set(await this.tracked.track(gameId, status));
  }

  protected async untrack(gameId: number, title: string): Promise<void> {
    if (!confirm(`Stop tracking ${title}?`)) return;
    this.trackMessage.set(await this.tracked.untrack(gameId));
  }

  protected changeSort(value: string): void {
    if (isGameSort(value)) this.apply({ ...this.filters(), sort: value });
  }
}

function chipsFor(f: SearchFilters): ActiveChip[] {
  const chips: ActiveChip[] = f.tags.map((tag) => ({
    key: `tag-${tag.id}`,
    label: tag.name,
    without: { ...f, tags: f.tags.filter((t) => t.id !== tag.id) },
  }));
  if (f.franchise)
    chips.push({ key: 'franchise', label: f.franchise.name, without: { ...f, franchise: null } });
  if (f.developer)
    chips.push({ key: 'developer', label: f.developer.name, without: { ...f, developer: null } });
  if (f.publisher)
    chips.push({ key: 'publisher', label: f.publisher.name, without: { ...f, publisher: null } });
  for (const mode of f.modes) {
    chips.push({
      key: `mode-${mode}`,
      label: MODE_LABELS[mode],
      without: { ...f, modes: f.modes.filter((m) => m !== mode) },
    });
  }
  if (f.system)
    chips.push({ key: 'system', label: SYSTEM_LABELS[f.system], without: { ...f, system: null } });
  return chips;
}
