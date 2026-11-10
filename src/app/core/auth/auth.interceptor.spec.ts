import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { fakeAuthProvider, fakeGateway } from '../../../testing/auth-testing';
import { TEST_ENV } from '../../../testing/test-env';
import { APP_ENV } from '../config/app-env.token';
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

  it('sends unverified accounts to verify-email on 403 email_not_verified', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const response = firstValueFrom(http.get('/api/currentuser/tracked')).catch(() => null);
    await Promise.resolve();
    controller
      .expectOne('/api/currentuser/tracked')
      .flush({ error: 'email_not_verified' }, { status: 403, statusText: 'Forbidden' });
    await response;
    expect(navigate).toHaveBeenCalledWith('/verify-email');
  });
});
