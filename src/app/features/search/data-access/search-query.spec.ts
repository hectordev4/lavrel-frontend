import { convertToParamMap } from '@angular/router';
import {
  activeFilterCount,
  emptyFilters,
  parseFilters,
  toApiParams,
  toQueryParams,
} from './search-query';

describe('search-query', () => {
  const params = convertToParamMap({
    q: ' rogue ',
    tag: ['1716:Roguelike', '29:Co-op', 'nonsense'],
    franchise: '55:Monster Hunter',
    mode: ['co-op', 'bogus'],
    system: 'pc',
    sort: 'RATING',
  });

  it('reads filters from the address, ignoring what it doesn’t know', () => {
    const f = parseFilters(params);
    expect(f.q).toBe('rogue');
    expect(f.tags).toEqual([
      { id: 1716, name: 'Roguelike' },
      { id: 29, name: 'Co-op' },
    ]);
    expect(f.franchise).toEqual({ id: 55, name: 'Monster Hunter' });
    expect(f.modes).toEqual(['co-op']);
    expect(f.system).toBe('PC');
    expect(f.sort).toBe('rating');
  });

  it('keeps at most 5 tags', () => {
    const many = convertToParamMap({ tag: ['1:a', '2:b', '3:c', '4:d', '5:e', '6:f'] });
    expect(parseFilters(many).tags.length).toBe(5);
  });

  it('writes the same address back', () => {
    const f = parseFilters(params);
    expect(toQueryParams(f)).toEqual({
      q: 'rogue',
      tag: ['1716:Roguelike', '29:Co-op'],
      franchise: '55:Monster Hunter',
      developer: null,
      publisher: null,
      mode: ['co-op'],
      system: 'PC',
      sort: 'rating',
    });
  });

  it('sends only ids to the API', () => {
    const api = toApiParams(parseFilters(params), 1, 20);
    expect(api.tags).toEqual([1716, 29]);
    expect(api.franchise).toBe(55);
    expect(api.page).toBe(1);
  });

  it('counts the active filters, not the query or the sort', () => {
    expect(activeFilterCount(parseFilters(params))).toBe(5);
    expect(activeFilterCount(emptyFilters('doom'))).toBe(0);
  });
});
