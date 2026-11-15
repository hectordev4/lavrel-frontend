import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { fakeAuthProvider, fakeGateway, signInAs } from '../../../testing/auth-testing';
import { TEST_ENV, memberUser } from '../../../testing/test-env';
import { APP_ENV } from '../config/app-env.token';
import { AuthStore } from './auth.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_ENV, useValue: TEST_ENV },
        fakeAuthProvider,
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('adds the Firebase token to API calls', async () => {
    const response = firstValueFrom(http.get('/api/games'));
    await Promise.resolve();
    const req = controller.expectOne('/api/games');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
    await response;
  });

  it('sends no header when nobody is signed in', async () => {
    fakeGateway().idToken.mockResolvedValue(null);
    const response = firstValueFrom(http.get('/api/games'));
    await Promise.resolve();
    const req = controller.expectOne('/api/games');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await response;
  });

  it('leaves other addresses alone', () => {
    http.get('https://example.com/data').subscribe();
    const req = controller.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  describe('auth errors for a signed-in member', () => {
    let navigate: ReturnType<typeof vi.fn>;
    const unauthorized = { status: 401, statusText: 'Unauthorized' };
    const forbidden = { status: 403, statusText: 'Forbidden' };
    const notVerified = { error: 'email_not_verified' };

    /** The next request to `url`, once the interceptor has sent it (a retry waits for the fresh token). */
    const sent = (url: string) => vi.waitFor(() => controller.expectOne(url));

    beforeEach(() => {
      signInAs(memberUser());
      fakeGateway().idToken.mockImplementation(async (force?: boolean) =>
        force ? 'fresh-456' : 'token-123',
      );
      navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true) as never;
    });

    it('sends a 401 again once with a fresh token, and nobody notices when that works', async () => {
      const response = firstValueFrom(http.get('/api/currentuser'));
      (await sent('/api/currentuser')).flush(null, unauthorized);

      const retry = await sent('/api/currentuser');
      expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh-456');
      retry.flush({ username: 'Aloy' });

      expect(await response).toEqual({ username: 'Aloy' });
      expect(fakeGateway().idToken).toHaveBeenCalledWith(true);
      expect(fakeGateway().signOut).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('ends the session as signed out when the API still says 401', async () => {
      const response = firstValueFrom(http.get('/api/currentuser')).catch((e) => e);
      (await sent('/api/currentuser')).flush(null, unauthorized);
      (await sent('/api/currentuser')).flush(null, unauthorized);

      expect((await response).status).toBe(401);
      await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/welcome?reason=signed_out'));
      expect(fakeGateway().signOut).toHaveBeenCalledTimes(1);
      expect(TestBed.inject(AuthStore).user()).toBeNull();
    });

    it('ends the session as expired when Firebase can’t give a fresh token', async () => {
      fakeGateway().idToken.mockImplementation(async (force?: boolean) => {
        if (force) throw new Error('auth/user-token-expired');
        return 'token-123';
      });
      const response = firstValueFrom(http.get('/api/currentuser')).catch((e) => e);
      (await sent('/api/currentuser')).flush(null, unauthorized);

      expect((await response).status).toBe(401);
      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith('/welcome?reason=session_expired'),
      );
      controller.expectNone('/api/currentuser'); // no retry without a token
    });

    it('ends the session once when several calls fail together', async () => {
      const responses = ['/api/a', '/api/b', '/api/c'].map((url) =>
        firstValueFrom(http.get(url)).catch(() => null),
      );
      for (const url of ['/api/a', '/api/b', '/api/c']) (await sent(url)).flush(null, unauthorized);
      for (const url of ['/api/a', '/api/b', '/api/c']) (await sent(url)).flush(null, unauthorized);
      await Promise.all(responses);

      await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
      expect(fakeGateway().signOut).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('lets a fresh token clear a 403 email_not_verified (the e-mail was confirmed elsewhere)', async () => {
      const response = firstValueFrom(http.get('/api/currentuser/tracked'));
      (await sent('/api/currentuser/tracked')).flush(notVerified, forbidden);
      (await sent('/api/currentuser/tracked')).flush([]);

      expect(await response).toEqual([]);
      expect(TestBed.inject(AuthStore).user()?.emailVerified).toBe(true);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('marks the account unverified and opens the verify page when the 403 stays', async () => {
      const response = firstValueFrom(http.get('/api/currentuser/tracked')).catch((e) => e);
      (await sent('/api/currentuser/tracked')).flush(notVerified, forbidden);
      (await sent('/api/currentuser/tracked')).flush(notVerified, forbidden);

      expect((await response).status).toBe(403);
      expect(TestBed.inject(AuthStore).user()?.emailVerified).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/verify-email');
      expect(fakeGateway().signOut).not.toHaveBeenCalled();
    });

    it('doesn’t retry other errors', async () => {
      for (const [status, body] of [
        [403, { error: 'forbidden' }],
        [500, null],
        [404, null],
      ] as const) {
        const response = firstValueFrom(http.get('/api/games')).catch((e) => e);
        (await sent('/api/games')).flush(body, { status, statusText: 'x' });
        expect((await response).status).toBe(status);
        controller.expectNone('/api/games');
      }
      expect(fakeGateway().idToken).not.toHaveBeenCalledWith(true);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('leaves guests where they are on a 401: their page shows its own error', async () => {
    fakeGateway().idToken.mockResolvedValue(null);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const response = firstValueFrom(http.get('/api/games')).catch((e) => e);
    await Promise.resolve();
    controller.expectOne('/api/games').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect((await response).status).toBe(401);
    controller.expectNone('/api/games');
    expect(fakeGateway().idToken).not.toHaveBeenCalledWith(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(fakeGateway().signOut).not.toHaveBeenCalled();
  });
});
