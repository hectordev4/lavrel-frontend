import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { TrackingApi } from './tracking.api';

describe('TrackingApi', () => {
  let api: TrackingApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders() });
    api = TestBed.inject(TrackingApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the list', () => {
    let count = -1;
    api.list().subscribe((games) => (count = games.length));
    http.expectOne('/api/currentuser/tracked').flush({ games: [{ gameId: 1 }, { gameId: 2 }] });
    expect(count).toBe(2);
  });

  it('tracks with a status and pins by game id', () => {
    api.track(7, 'BACKLOG').subscribe();
    const put = http.expectOne('/api/currentuser/tracked/7');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ status: 'BACKLOG' });
    put.flush({});

    api.pin(7).subscribe();
    const pin = http.expectOne('/api/currentuser/tracked/7/pin');
    expect(pin.request.method).toBe('PUT');
    pin.flush({ games: [] });
  });

  it('reorders quick access with every pinned id', () => {
    api.reorder([3, 1]).subscribe();
    const req = http.expectOne('/api/currentuser/tracked/quick-access');
    expect(req.request.body).toEqual({ gameIds: [3, 1] });
    req.flush({ games: [] });
  });
});
