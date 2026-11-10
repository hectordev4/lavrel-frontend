import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { PickerApi } from './picker.api';

describe('PickerApi', () => {
  it('lists games with unlocks, and the unlocks of one game', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    const api = TestBed.inject(PickerApi);
    const http = TestBed.inject(HttpTestingController);
    api.games(' hades ', 'name', 1).subscribe();
    const games = http.expectOne((r) => r.url === '/api/currentuser/achievements/games');
    expect(games.request.params.get('q')).toBe('hades');
    expect(games.request.params.get('sort')).toBe('name');
    expect(games.request.params.get('page')).toBe('1');
    expect(games.request.params.get('size')).toBe('24');
    api.unlocked(7, 'date').subscribe();
    const unlocked = http.expectOne((r) => r.url === '/api/currentuser/games/7/achievements/unlocked');
    expect(unlocked.request.params.get('sort')).toBe('date');
  });
});
