import { DatePipe, DecimalPipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrackingStatus } from '../../../../core/api/models/tracking-status.model';
import { AuthStore } from '../../../../core/auth/auth.store';
import { TrackedGames } from '../../../../core/tracking/tracked-games';
import { map } from 'rxjs';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { TrackControl } from '../../../../shared/ui/track-control/track-control';
import { featureNames, systemLabel, systemsOf } from '../../data-access/game-facts';
import { GameAchievementsStore } from '../../data-access/game-achievements';
import { GamePage as GamePageStore } from '../../data-access/game-page';
import { AchievementFilter } from '../../models/achievement-filter.model';
import { GameDetails } from '../../models/game-details.model';
import { AchievementItem } from '../../ui/achievement-item/achievement-item';
import { ProgressCard } from '../../ui/progress-card/progress-card';
import { Segmented } from '../../../../shared/ui/segmented/segmented';

const SHORT_TAGS = 8;

/** /games/:slug: cover, title, release, rating, systems, about, tags, genres, details and achievements. */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Segmented,
    DatePipe,
    DecimalPipe,
    RouterLink,
    GameCover,
    TrackControl,
    AchievementItem,
    ProgressCard,
  ],
  providers: [GamePageStore, GameAchievementsStore],
  templateUrl: './game.page.html',
  styleUrl: './game.page.scss',
})
export class GamePage {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  protected readonly store = inject(GamePageStore);
  protected readonly achievements = inject(GameAchievementsStore);
  protected readonly filters: { value: AchievementFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unlocked', label: 'Unlocked' },
    { value: 'locked', label: 'Locked' },
  ];
  protected readonly tracked = inject(TrackedGames);
  protected readonly signedIn = inject(AuthStore).isVerified;
  protected readonly trackMessage = signal<string | null>(null);
  protected readonly invalidAddress = signal(false);
  protected readonly descriptionOpen = signal(false);
  protected readonly allTags = signal(false);

  protected readonly game = computed<GameDetails | null>(() => {
    const s = this.store.state();
    return s.kind === 'ready' ? s.game : null;
  });
  protected readonly systems = computed(() => {
    const g = this.game();
    return g ? systemsOf(g).map(systemLabel) : [];
  });
  protected readonly tags = computed(() => {
    const g = this.game();
    if (!g) return [];
    return this.allTags() ? g.tags : g.tags.slice(0, SHORT_TAGS);
  });
  protected readonly details = computed(() => {
    const g = this.game();
    if (!g) return [];
    const rows: { label: string; value: string }[] = [
      {
        label: g.developers.length > 1 ? 'Developers' : 'Developer',
        value: g.developers.join(', '),
      },
      {
        label: g.publishers.length > 1 ? 'Publishers' : 'Publisher',
        value: g.publishers.join(', '),
      },
      { label: 'Franchise', value: g.franchises.join(', ') },
      { label: 'Price', value: g.free ? 'Free to play' : 'Paid' },
      { label: 'Available on', value: this.systems().join(', ') },
      { label: 'Player modes', value: featureNames(g, 'PLAYER_MODE').join(', ') },
      { label: 'Controller', value: featureNames(g, 'CONTROLLER').join(', ') },
      { label: 'Accessibility', value: featureNames(g, 'ACCESSIBILITY').join(', ') },
    ];
    return rows.filter((row) => row.value);
  });
  protected readonly shortTagCount = SHORT_TAGS;
  /** This game in the member's tracking list, or undefined. */
  protected readonly trackedEntry = computed(() => {
    const g = this.game();
    return g ? this.tracked.byGameId().get(g.id) : undefined;
  });

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        map((params) => params.get('slug')?.trim() ?? ''),
        takeUntilDestroyed(),
      )
      .subscribe((slug) => {
        this.invalidAddress.set(!slug);
        if (slug) this.store.load(slug);
      });

    // The achievements need the game's id, which comes with the game.
    let loadedId: number | null = null;
    effect(() => {
      const id = this.game()?.id ?? null;
      if (id !== null && id !== loadedId) {
        loadedId = id;
        untracked(() => this.achievements.load(id));
      }
    });

    this.tracked.ensureLoaded();

    const title = inject(Title);
    effect(() => {
      const g = this.game();
      if (g) title.setTitle(`${g.title} · Lavrel`);
    });
  }

  protected async track(status: TrackingStatus): Promise<void> {
    const g = this.game();
    if (g) this.trackMessage.set(await this.tracked.track(g.id, status));
  }

  protected async untrack(): Promise<void> {
    const g = this.game();
    if (!g || !confirm(`Stop tracking ${g.title}?`)) return;
    this.trackMessage.set(await this.tracked.untrack(g.id));
  }

  protected async togglePin(): Promise<void> {
    const g = this.game();
    const entry = this.trackedEntry();
    if (!g || !entry) return;
    this.trackMessage.set(
      entry.pinPosition === null ? await this.tracked.pin(g.id) : await this.tracked.unpin(g.id),
    );
  }

  protected back(): void {
    if (window.history.length > 1) this.location.back();
    else void this.router.navigateByUrl('/search');
  }
}
