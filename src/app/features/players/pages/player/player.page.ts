import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { PlayersApi } from '../../data-access/players.api';
import { memberSinceLabel } from '../../data-access/shelf-labels';
import { PlayerPageState } from '../../models/player-page-state.model';
import { Shelf } from '../../ui/shelf/shelf';

const PLATFORM_NAMES: Record<string, string> = { STEAM: 'Steam', XBOX: 'Xbox', PLAYSTATION: 'PlayStation' };

/** /players/:publicId: someone's public profile. Open to everyone; private profiles look like unknown ones. */
@Component({
  selector: 'app-player-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Shelf],
  templateUrl: './player.page.html',
  styleUrl: './player.page.scss',
})
export class PlayerPage {
  private readonly api = inject(PlayersApi);
  protected readonly state = signal<PlayerPageState>({ kind: 'loading' });

  protected readonly header = computed(() => {
    const s = this.state();
    return s.kind === 'ready' ? s.profile.profile : null;
  });
  protected readonly shelves = computed(() => {
    const s = this.state();
    return s.kind === 'ready' ? s.profile.shelves : [];
  });
  protected readonly playerId = computed(() => String(this.header()?.publicId ?? '').replace(/(\d{4})(?=\d)/g, '$1 '));
  protected readonly joined = computed(() => memberSinceLabel(this.header()?.memberSince ?? null));
  protected readonly platformName = (p: string) => PLATFORM_NAMES[p] ?? p;

  /** Asks for the current profile again (Try again). */
  private readonly retry = new Subject<void>();

  constructor() {
    // One request at a time: a new id (or Try again) cancels the request still running, so an older answer
    // can never replace the profile of the address you are on.
    const publicId$ = inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('publicId') ?? ''));
    publicId$
      .pipe(
        switchMap((id) => this.retry.pipe(startWith(undefined), map(() => id))),
        switchMap((id) =>
          this.api.profile(id).pipe(
            map((profile): PlayerPageState => ({ kind: 'ready', profile })),
            catchError((e: unknown) =>
              of<PlayerPageState>(e instanceof HttpErrorResponse && e.status === 404 ? { kind: 'not-found' } : { kind: 'error' }),
            ),
            startWith<PlayerPageState>({ kind: 'loading' }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));

    const title = inject(Title);
    effect(() => {
      const h = this.header();
      if (h) title.setTitle(`${h.username} · Lavrel`);
    });
  }

  protected load(): void {
    this.retry.next();
  }
}
