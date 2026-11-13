import { DatePipe, DecimalPipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { detailRows, systemLabel, systemsOf } from '../../data-access/game-facts';
import { GamePage as GamePageStore } from '../../data-access/game-page';
import { GameDetails } from '../../models/game-details.model';
import { GameAchievementsSection } from '../../sections/achievements/game-achievements.section';
import { GameAbout } from '../../ui/game-about/game-about';
import { GameLabels } from '../../ui/game-labels/game-labels';
import { GameTracking } from '../../ui/game-tracking/game-tracking';

/** /games/:slug: cover, title, release, rating, systems, about, tags, genres, details and achievements. */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    GameCover,
    GameTracking,
    GameAbout,
    GameLabels,
    GameAchievementsSection,
  ],
  providers: [GamePageStore],
  templateUrl: './game.page.html',
  styleUrl: './game.page.scss',
})
export class GamePage {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  protected readonly store = inject(GamePageStore);
  protected readonly invalidAddress = signal(false);

  protected readonly game = computed<GameDetails | null>(() => {
    const s = this.store.state();
    return s.kind === 'ready' ? s.game : null;
  });
  protected readonly systems = computed(() => {
    const g = this.game();
    return g ? systemsOf(g).map(systemLabel) : [];
  });
  protected readonly details = computed(() => {
    const g = this.game();
    return g ? detailRows(g) : [];
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

    const title = inject(Title);
    effect(() => {
      const g = this.game();
      if (g) title.setTitle(`${g.title} · Lavrel`);
    });
  }

  protected back(): void {
    if (window.history.length > 1) this.location.back();
    else void this.router.navigateByUrl('/search');
  }
}
