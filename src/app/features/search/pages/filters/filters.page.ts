import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameSort } from '../../../../core/api/models/game-sort.model';
import { GameSystem } from '../../../../core/api/models/game-system.model';
import { Chip } from '../../../../shared/ui/chip/chip';
import { FilterOptionsApi } from '../../data-access/filter-options.api';
import { OptionSearch } from '../../data-access/option-search';
import { MODE_LABELS, SORT_LABELS, SYSTEM_LABELS } from '../../data-access/search-labels';
import {
  MAX_TAGS,
  emptyFilters,
  parseFilters,
  toQueryParams,
} from '../../data-access/search-query';
import { FilterOption } from '../../models/filter-option.model';
import { PlayerMode } from '../../models/player-mode.model';
import { SearchFilters } from '../../models/search-filters.model';
import { TypeaheadField } from '../../ui/typeahead-field/typeahead-field';

type CreatorKey = 'franchise' | 'developer' | 'publisher';

/** Full-screen filters. Changes stay in a draft until "Show results". */
@Component({
  selector: 'app-filters-page',
  host: { '[class.embedded]': 'embedded()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Chip, TypeaheadField],
  templateUrl: './filters.page.html',
  styleUrl: './filters.page.scss',
})
export class FiltersPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly original = parseFilters(this.route.snapshot.queryParamMap);
  /** Shown as the results page's side panel on desktop: no close button, and it follows the address. */
  readonly embedded = input(false);

  protected readonly draft = signal<SearchFilters>(this.original);
  protected readonly maxTags = MAX_TAGS;
  protected readonly backParams = toQueryParams(this.original);
  protected readonly sortOptions = computed(() =>
    (Object.keys(SORT_LABELS) as GameSort[])
      .filter((s) => s !== 'relevance' || this.draft().q)
      .map((value) => ({ value, label: SORT_LABELS[value] })),
  );
  protected readonly currentSort = computed<GameSort>(
    () => this.draft().sort ?? (this.draft().q ? 'relevance' : 'popular'),
  );
  protected readonly modes = Object.entries(MODE_LABELS) as [PlayerMode, string][];
  protected readonly systems = Object.entries(SYSTEM_LABELS) as [GameSystem, string][];
  protected readonly creators: { key: CreatorKey; label: string }[] = [
    { key: 'franchise', label: 'Franchise' },
    { key: 'developer', label: 'Developer' },
    { key: 'publisher', label: 'Publisher' },
  ];

  protected readonly tagSearch: OptionSearch;
  protected readonly creatorSearch: Record<CreatorKey, OptionSearch>;

  constructor() {
    // As the results' side panel, the address changes under it (a chip removed, a new search in the header):
    // start again from what the address says.
    this.route.queryParamMap
      ?.pipe(takeUntilDestroyed())
      .subscribe((params) => this.draft.set(parseFilters(params)));
    const api = inject(FilterOptionsApi);
    const destroyRef = inject(DestroyRef);
    this.tagSearch = new OptionSearch((q) => api.tags(q), destroyRef);
    this.creatorSearch = {
      franchise: new OptionSearch((q) => api.creators('FRANCHISE', q), destroyRef),
      developer: new OptionSearch((q) => api.creators('DEVELOPER', q), destroyRef),
      publisher: new OptionSearch((q) => api.creators('PUBLISHER', q), destroyRef),
    };
  }

  protected setSort(sort: GameSort): void {
    this.draft.update((f) => ({ ...f, sort }));
  }

  protected addTag(option: FilterOption): void {
    this.draft.update((f) =>
      f.tags.some((t) => t.id === option.id) || f.tags.length >= MAX_TAGS
        ? f
        : { ...f, tags: [...f.tags, { id: option.id, name: option.name }] },
    );
  }

  protected removeTag(id: number): void {
    this.draft.update((f) => ({ ...f, tags: f.tags.filter((t) => t.id !== id) }));
  }

  protected toggleMode(mode: PlayerMode): void {
    this.draft.update((f) => ({
      ...f,
      modes: f.modes.includes(mode) ? f.modes.filter((m) => m !== mode) : [...f.modes, mode],
    }));
  }

  protected toggleSystem(system: GameSystem): void {
    this.draft.update((f) => ({ ...f, system: f.system === system ? null : system }));
  }

  protected setCreator(key: CreatorKey, option: FilterOption | null): void {
    this.draft.update((f) => ({
      ...f,
      [key]: option ? { id: option.id, name: option.name } : null,
    }));
  }

  protected clearAll(): void {
    this.draft.set(emptyFilters(this.draft().q));
  }

  protected showResults(): void {
    void this.router.navigate(['/search/results'], { queryParams: toQueryParams(this.draft()) });
  }
}
