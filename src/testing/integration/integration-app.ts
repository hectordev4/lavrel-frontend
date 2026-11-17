import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SwUpdate } from '@angular/service-worker';
import { routes } from '../../app/app.routes';
import { authInterceptor } from '../../app/core/auth/auth.interceptor';
import { AuthStore } from '../../app/core/auth/auth.store';
import { AuthUser } from '../../app/core/auth/models/auth-user.model';
import { APP_ENV } from '../../app/core/config/app-env.token';
import { fakeAuthProvider, fakeGateway } from '../auth-testing';
import { installDialogStandIn } from '../dialog';
import { FakeAuthGateway } from '../fake-auth-gateway';
import { installIntersectionObserverStandIn } from '../intersection-observer';
import { TEST_ENV, memberUser } from '../test-env';
import { FakeBackend, fakeBackendInterceptor } from './fake-backend';

export interface StartOptions {
  /** Who Firebase restores at start-up; null for nobody. Default: a verified member. */
  user?: AuthUser | null;
  /** Sets up the backend's data before the app makes its first call. */
  backend?: (backend: FakeBackend) => void;
}

/**
 * Starts the app as it runs in the browser, minus Firebase and the network: the real routes, guards, lazy pages
 * and auth interceptor, with FakeAuthGateway for sign-in and FakeBackend answering /api. Other HTTP calls go to
 * HttpTestingController. Pages are driven through the DOM, the way a person would.
 */
export async function startApp(options: StartOptions = {}): Promise<IntegrationApp> {
  installDialogStandIn();
  installIntersectionObserverStandIn();
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptors([authInterceptor, fakeBackendInterceptor])),
      provideHttpClientTesting(),
      { provide: APP_ENV, useValue: TEST_ENV },
      fakeAuthProvider,
      { provide: SwUpdate, useValue: { isEnabled: false } },
    ],
  });
  const backend = TestBed.inject(FakeBackend);
  options.backend?.(backend);
  TestBed.inject(AuthStore).set(options.user === undefined ? memberUser() : options.user);
  return new IntegrationApp(await RouterTestingHarness.create(), backend);
}

export class IntegrationApp {
  constructor(
    readonly harness: RouterTestingHarness,
    readonly backend: FakeBackend,
  ) {}

  get auth(): FakeAuthGateway {
    return fakeGateway();
  }

  get el(): HTMLElement {
    return this.harness.routeNativeElement!;
  }

  /** The address bar. */
  get url(): string {
    return TestBed.inject(Router).url;
  }

  async visit(url: string): Promise<void> {
    await this.harness.navigateByUrl(url);
    await this.settle();
  }

  /** Lets guards, lazy pages, HTTP answers and the effects they start all finish, then renders. */
  async settle(): Promise<void> {
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve));
      await this.harness.fixture.whenStable();
      this.harness.detectChanges();
    }
  }

  /** Waits past a debounce (search boxes wait 300 ms after the last key). */
  async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await this.settle();
  }

  text(): string {
    return squash(this.el.textContent);
  }

  /** The button or link whose visible text (or aria-label) starts with `label`. Fails if there is none. */
  control(label: string): HTMLElement {
    const all = [...this.el.querySelectorAll<HTMLElement>('button, a, summary')];
    const found = all.find((e) => {
      const name = e.getAttribute('aria-label') ?? squash(e.textContent);
      return name.startsWith(label);
    });
    if (!found)
      throw new Error(
        `No button or link "${label}". Saw: ${all
          .map((e) => squash(e.textContent))
          .filter(Boolean)
          .join(' | ')}`,
      );
    return found;
  }

  has(label: string): boolean {
    try {
      this.control(label);
      return true;
    } catch {
      return false;
    }
  }

  async click(label: string): Promise<void> {
    const target = this.control(label);
    if (target.tagName === 'SUMMARY') {
      const details = target.parentElement as HTMLDetailsElement;
      details.open = !details.open;
    } else {
      target.click();
    }
    await this.settle();
  }

  /** Types into the input or textarea with this placeholder, or inside the label with this text. */
  async type(field: string, value: string): Promise<void> {
    const input = this.input(field);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await this.settle();
  }

  input(field: string): HTMLInputElement {
    const byPlaceholder = this.el.querySelector<HTMLInputElement>(
      `input[placeholder="${field}"], textarea[placeholder="${field}"]`,
    );
    if (byPlaceholder) return byPlaceholder;
    const label = [...this.el.querySelectorAll('label')].find((l) =>
      squash(l.textContent).startsWith(field),
    );
    const input =
      label?.querySelector('input') ??
      (label?.htmlFor ? this.el.querySelector<HTMLInputElement>(`#${label.htmlFor}`) : null);
    if (!input) throw new Error(`No input "${field}"`);
    return input as HTMLInputElement;
  }

  async select(label: string, value: string): Promise<void> {
    const field = [...this.el.querySelectorAll('label')].find((l) =>
      squash(l.textContent).startsWith(label),
    );
    const select = field?.querySelector('select');
    if (!select) throw new Error(`No select "${label}"`);
    select.value = value;
    select.dispatchEvent(new Event('change'));
    await this.settle();
  }

  /** Submits the form this field belongs to, as Enter or a send button would. */
  async submit(field: string): Promise<void> {
    this.input(field)
      .closest('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await this.settle();
  }

  /** Submits the form inside the open dialog. */
  async submitDialog(): Promise<void> {
    const form = this.openDialog().querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await this.settle();
  }

  openDialog(): HTMLDialogElement {
    const dialog = [...document.querySelectorAll('dialog')].find((d) => d.open);
    if (!dialog) throw new Error('No dialog is open');
    return dialog;
  }

  /** Titles of the game cards on the page, in order. */
  cardTitles(): string[] {
    return [...this.el.querySelectorAll('app-library-card a.title')].map((a) =>
      squash(a.textContent),
    );
  }

  /** The library's collection chips, as "Name count", and which one is pressed. */
  chips(): { labels: string[]; pressed: string | null } {
    const buttons = [...this.el.querySelectorAll('.collections app-chip button')];
    const labels = buttons.map((b) => squash(b.textContent));
    const pressed = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
    return { labels, pressed: pressed ? squash(pressed.textContent) : null };
  }

  /** The text shown in a role="status" or role="alert" element. */
  messages(): string[] {
    return [...this.el.querySelectorAll('[role="status"], [role="alert"]')]
      .map((e) => squash(e.textContent))
      .filter(Boolean);
  }
}

function squash(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}
