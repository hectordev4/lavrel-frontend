import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { gameDetails } from '../../../../testing/fixtures';
import { testProviders } from '../../../../testing/test-env';
import { GamePage } from './game-page';

describe('GamePage store', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: testProviders(GamePage) }));

  it('loads by slug', () => {
    const store = TestBed.inject(GamePage);
    store.load('rogue-harbor');
    TestBed.inject(HttpTestingController)
      .expectOne('/api/games/slug/rogue-harbor')
      .flush(gameDetails());
    expect(store.state().kind).toBe('ready');
  });

  it('turns a 404 into not-found', () => {
    const store = TestBed.inject(GamePage);
    store.load('nope');
    TestBed.inject(HttpTestingController)
      .expectOne('/api/games/slug/nope')
      .flush(null, { status: 404, statusText: 'x' });
    expect(store.state().kind).toBe('not-found');
  });
});

describe('GamePage store, switching games', () => {
  it('cancels the older request when another slug loads', () => {
    TestBed.configureTestingModule({ providers: testProviders(GamePage) });
    const store = TestBed.inject(GamePage);
    const http = TestBed.inject(HttpTestingController);
    store.load('first');
    const first = http.expectOne('/api/games/slug/first');
    store.load('second');
    expect(first.cancelled).toBe(true);
    http.expectOne('/api/games/slug/second').flush(gameDetails({ title: 'Second' }));
    const s = store.state();
    expect(s.kind === 'ready' && s.game.title).toBe('Second');
  });
});
