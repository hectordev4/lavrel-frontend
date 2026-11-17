import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, of, take, throwError } from 'rxjs';
import { PlatformAccount } from '../../app/core/api/models/platform-account.model';
import { Collection } from '../../app/core/api/models/collection.model';
import { CurrentUser } from '../../app/core/api/models/current-user.model';
import { LibraryGame } from '../../app/core/api/models/library-game.model';
import { TrackedGame } from '../../app/core/api/models/tracked-game.model';

/** What a route handler returns: a body (200), or an error status with an optional `{ error: code }` body. */
type Reply = { status?: number; body?: unknown };
type Handler = (req: HttpRequest<unknown>, match: RegExpMatchArray) => Reply;

/**
 * A small in-memory Lavrel API for integration tests. It answers the endpoints the tested journeys use from
 * state the test sets up (the user, the linked accounts, the tracked games, the library and the collections) and changes that
 * state on writes, so a journey sees its own changes like it would on the real backend. Every request it sees
 * is kept in `requests`, with the headers the real interceptors added.
 *
 * Tests can replace one answer with `failNext` (an error status, or 0 for no connection) or `hold` (an answer
 * that waits until the test releases it). Endpoints it doesn't know get a 404 and are listed in `unhandled`.
 */
@Injectable({ providedIn: 'root' })
export class FakeBackend {
  user: CurrentUser = {
    publicId: '4829103755210846',
    username: 'Player',
    countryId: null,
    setupCompleted: true,
  };
  accounts: PlatformAccount[] = [
    { platform: 'STEAM', externalId: '7656', displayName: 'player', lastSyncedAt: null },
  ];
  games: LibraryGame[] = [];
  tracked: TrackedGame[] = [];
  collections: Collection[] = [];
  /** Which games are in each collection, by collection id. */
  readonly inCollection = new Map<string, Set<number>>();

  readonly requests: HttpRequest<unknown>[] = [];
  readonly unhandled: string[] = [];
  private readonly overrides: {
    method: string;
    path: RegExp;
    answer: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;
  }[] = [];
  private nextId = 1;

  private readonly routes: [string, RegExp, Handler][] = [
    ['GET', /^\/api\/currentuser$/, () => ({ body: this.user })],
    [
      'PUT',
      /^\/api\/currentuser\/setup$/,
      () => {
        this.user = { ...this.user, setupCompleted: true };
        return { status: 204 };
      },
    ],
    [
      'PATCH',
      /^\/api\/currentuser\/username$/,
      (req) => {
        this.user = { ...this.user, username: (req.body as { username: string }).username };
        return { status: 204 };
      },
    ],
    [
      'GET',
      /^\/api\/countries$/,
      () => ({ body: { countries: [{ id: 724, code: 'ES', name: 'Spain' }] } }),
    ],
    [
      'GET',
      /^\/api\/currentuser\/profile\/avatar$/,
      () => ({
        body: { kind: 'GENERATED', galleryId: null, imageUrl: null },
      }),
    ],
    ['GET', /^\/api\/currentuser\/accounts$/, () => ({ body: { accounts: this.accounts } })],
    ['GET', /^\/api\/currentuser\/tracked$/, () => ({ body: { games: this.tracked } })],
    ['GET', /^\/api\/currentuser\/games$/, (req) => ({ body: this.libraryPage(req) })],
    [
      'GET',
      /^\/api\/currentuser\/collections$/,
      () => ({ body: { collections: this.collectionList() } }),
    ],
    [
      'POST',
      /^\/api\/currentuser\/collections$/,
      (req) => {
        const name = (req.body as { name: string }).name;
        if (this.collections.some((c) => c.name.toLowerCase() === name.toLowerCase()))
          return { status: 409, body: { error: 'collection_name_taken' } };
        const created: Collection = {
          id: `c${this.nextId++}`,
          name,
          position: this.collections.length + 1,
          gameCount: 0,
        };
        this.collections.push(created);
        this.inCollection.set(created.id, new Set());
        return { status: 201, body: created };
      },
    ],
    [
      'PATCH',
      /^\/api\/currentuser\/collections\/([^/]+)$/,
      (req, [, id]) => {
        const c = this.collections.find((x) => x.id === id);
        if (!c) return { status: 404, body: { error: 'collection_not_found' } };
        c.name = (req.body as { name: string }).name;
        return { body: this.withCount(c) };
      },
    ],
    [
      'DELETE',
      /^\/api\/currentuser\/collections\/([^/]+)$/,
      (_req, [, id]) => {
        this.collections = this.collections.filter((c) => c.id !== id);
        this.inCollection.delete(id);
        return { status: 204 };
      },
    ],
    [
      'PUT',
      /^\/api\/currentuser\/collections\/([^/]+)\/games\/(\d+)$/,
      (_req, [, id, gameId]) => {
        const games = this.inCollection.get(id);
        if (!games) return { status: 404, body: { error: 'collection_not_found' } };
        if (!this.games.some((g) => g.gameId === Number(gameId)))
          return { status: 404, body: { error: 'game_not_owned' } };
        games.add(Number(gameId));
        return { status: 204 };
      },
    ],
    [
      'DELETE',
      /^\/api\/currentuser\/collections\/([^/]+)\/games\/(\d+)$/,
      (_req, [, id, gameId]) => {
        this.inCollection.get(id)?.delete(Number(gameId));
        return { status: 204 };
      },
    ],
  ];

  /** The next `method path` request fails with this status (0: no connection) and `{ error: code }` body. */
  failNext(method: string, path: RegExp, status: number, code?: string): void {
    this.overrides.push({
      method,
      path,
      answer: () =>
        throwError(() =>
          status === 0
            ? new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' })
            : new HttpErrorResponse({ status, error: code ? { error: code } : null }),
        ),
    });
  }

  /** The next `method path` request waits; `release()` answers it from the state at that moment. */
  hold(method: string, path: RegExp): { release: () => void } {
    const gate = new Subject<void>();
    this.overrides.push({
      method,
      path,
      answer: (req) =>
        new Observable<HttpEvent<unknown>>((subscriber) => {
          const waiting = gate
            .pipe(take(1))
            .subscribe(() => this.respond(req).subscribe(subscriber));
          return () => waiting.unsubscribe();
        }),
    });
    return { release: () => gate.next() };
  }

  /** Requests to the API, as `METHOD /path?query`, in the order they were sent. */
  calls(): string[] {
    return this.requests.map((r) => `${r.method} ${r.urlWithParams}`);
  }

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.requests.push(req);
    const path = req.url;
    const i = this.overrides.findIndex((o) => o.method === req.method && o.path.test(path));
    if (i >= 0) {
      const [override] = this.overrides.splice(i, 1);
      return override.answer(req);
    }
    return this.respond(req);
  }

  private respond(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    for (const [method, pattern, handler] of this.routes) {
      const match = req.method === method ? req.url.match(pattern) : null;
      if (!match) continue;
      const { status = 200, body = null } = handler(req, match);
      if (status >= 400)
        return throwError(() => new HttpErrorResponse({ status, url: req.url, error: body }));
      // Copy the body, like JSON over the wire: the app never shares objects with this state.
      return of(
        new HttpResponse({
          status,
          url: req.url,
          body: body === null ? null : structuredClone(body),
        }),
      );
    }
    this.unhandled.push(`${req.method} ${req.url}`);
    return throwError(
      () => new HttpErrorResponse({ status: 404, url: req.url, error: { error: 'not_found' } }),
    );
  }

  private withCount(c: Collection): Collection {
    return { ...c, gameCount: this.inCollection.get(c.id)?.size ?? 0 };
  }

  private collectionList(): Collection[] {
    return this.collections.map((c) => this.withCount(c));
  }

  private libraryPage(req: HttpRequest<unknown>) {
    const p = req.params;
    const q = p.get('q')?.toLowerCase();
    const collection = p.get('collection');
    const page = Number(p.get('page') ?? 0);
    const size = Number(p.get('size') ?? 48);
    let games = this.games.filter((g) => !q || g.title.toLowerCase().includes(q));
    if (collection) {
      const ids = this.inCollection.get(collection) ?? new Set<number>();
      games = games.filter((g) => ids.has(g.gameId));
    }
    const sort = p.get('sort');
    if (sort === 'name') games = [...games].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'playtime')
      games = [...games].sort((a, b) => b.playtimeMinutes - a.playtimeMinutes);
    return {
      games: games.slice(page * size, (page + 1) * size),
      page,
      size,
      hasMore: (page + 1) * size < games.length,
    };
  }
}

/** Last interceptor in integration tests: hands every API call to the FakeBackend instead of the network. */
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith('/api/') ? inject(FakeBackend).handle(req) : next(req);
