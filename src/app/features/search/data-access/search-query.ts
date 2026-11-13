import { ParamMap, Params } from '@angular/router';
import { GameSearchParams } from '../../../core/api/models/game-search-params.model';
import { GameSort } from '../../../core/api/models/game-sort.model';
import { GameSystem } from '../../../core/api/models/game-system.model';
import { NamedFilter } from '../models/named-filter.model';
import { PlayerMode } from '../models/player-mode.model';
import { SearchFilters } from '../models/search-filters.model';

export const MAX_TAGS = 5;

const MODES: readonly PlayerMode[] = ['single-player', 'co-op', 'multiplayer'];
const SYSTEMS: readonly GameSystem[] = ['PC', 'XBOX', 'PLAYSTATION'];
const SORTS: readonly GameSort[] = ['relevance', 'popular', 'rating', 'newest', 'name'];

/** Reads the filters from the address: ?q=…&tag=1716:Roguelike&franchise=55:Name&mode=co-op&system=PC&sort=rating */
export function parseFilters(params: ParamMap): SearchFilters {
  const q = params.get('q')?.trim() || null;
  return {
    q,
    tags: params.getAll('tag').map(parseNamed).filter(isNamed).slice(0, MAX_TAGS),
    franchise: parseNamed(params.get('franchise')),
    developer: parseNamed(params.get('developer')),
    publisher: parseNamed(params.get('publisher')),
    modes: params.getAll('mode').filter((m): m is PlayerMode => MODES.includes(m as PlayerMode)),
    system: pick(params.get('system'), SYSTEMS),
    sort: pick(params.get('sort'), SORTS),
  };
}

/** The address for a set of filters (empty ones left out). */
export function toQueryParams(f: SearchFilters): Params {
  return {
    q: f.q ?? null,
    tag: f.tags.length ? f.tags.map(formatNamed) : null,
    franchise: f.franchise ? formatNamed(f.franchise) : null,
    developer: f.developer ? formatNamed(f.developer) : null,
    publisher: f.publisher ? formatNamed(f.publisher) : null,
    mode: f.modes.length ? f.modes : null,
    system: f.system,
    sort: f.sort,
  };
}

/** The request for GET /api/games. */
export function toApiParams(f: SearchFilters, page: number, size: number): GameSearchParams {
  return {
    q: f.q ?? undefined,
    tags: f.tags.map((t) => t.id),
    franchise: f.franchise?.id,
    developer: f.developer?.id,
    publisher: f.publisher?.id,
    modes: f.modes,
    system: f.system ?? undefined,
    sort: f.sort ?? undefined,
    page,
    size,
  };
}

/** How many filters are on, not counting the query and the sort. */
export function activeFilterCount(f: SearchFilters): number {
  return (
    f.tags.length +
    [f.franchise, f.developer, f.publisher, f.system].filter(Boolean).length +
    f.modes.length
  );
}

export function emptyFilters(q: string | null = null): SearchFilters {
  return {
    q,
    tags: [],
    franchise: null,
    developer: null,
    publisher: null,
    modes: [],
    system: null,
    sort: null,
  };
}

function parseNamed(value: string | null): NamedFilter | null {
  if (!value) return null;
  const colon = value.indexOf(':');
  const id = Number(colon === -1 ? value : value.slice(0, colon));
  if (!Number.isInteger(id) || id <= 0) return null;
  return { id, name: colon === -1 ? `#${id}` : value.slice(colon + 1) };
}

function formatNamed(filter: NamedFilter): string {
  return `${filter.id}:${filter.name}`;
}

function isNamed(value: NamedFilter | null): value is NamedFilter {
  return value !== null;
}

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  const lower = value?.toLowerCase();
  return allowed.find((a) => a.toLowerCase() === lower) ?? null;
}
