import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { featureNames, gameIdFrom, systemLabel, systemsOf } from '../../data-access/game-facts';
import { GamePage as GamePageStore } from '../../data-access/game-page';
import { GameDetails } from '../../models/game-details.model';

const SHORT_TAGS = 8;

/** /games/:id-slug: cover, title, release, rating, systems, about, tags, genres and details. */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, RouterLink, GameCover],
  providers: [GamePageStore],
  templateUrl: './game.page.html',
  styleUrl: './game.page.scss',
})
export class GamePage {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  protected readonly store = inject(GamePageStore);
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
      { label: g.developers.length > 1 ? 'Developers' : 'Developer', value: g.developers.join(', ') },
      { label: g.publishers.length > 1 ? 'Publishers' : 'Publisher', value: g.publishers.join(', ') },
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

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(map((params) => gameIdFrom(params.get('game'))), takeUntilDestroyed())
      .subscribe((id) => {
        this.invalidAddress.set(id === null);
        if (id !== null) this.store.load(id);
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
