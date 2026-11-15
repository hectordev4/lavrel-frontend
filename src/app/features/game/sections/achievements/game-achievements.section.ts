import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { AuthStore } from '../../../../core/auth/auth.store';
import { Segmented } from '../../../../shared/ui/segmented/segmented';
import { GameAchievementsStore } from '../../data-access/game-achievements';
import { AchievementFilter } from '../../models/achievement-filter.model';
import { GameDetails } from '../../models/game-details.model';
import { AchievementItem } from '../../ui/achievement-item/achievement-item';
import { ProgressCard } from '../../ui/progress-card/progress-card';

/**
 * The game page's achievements: your progress, the list with worldwide (and your country's) percentages, the
 * filter and Show all. Loads its own data, so a failure here never takes the rest of the game page down.
 */
@Component({
  selector: 'app-game-achievements-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Segmented, AchievementItem, ProgressCard],
  providers: [GameAchievementsStore],
  templateUrl: './game-achievements.section.html',
  styleUrl: './game-achievements.section.scss',
})
export class GameAchievementsSection {
  readonly game = input.required<Pick<GameDetails, 'id' | 'title' | 'slug'>>();

  protected readonly achievements = inject(GameAchievementsStore);
  protected readonly signedIn = inject(AuthStore).isVerified;
  protected readonly filters: { value: AchievementFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unlocked', label: 'Unlocked' },
    { value: 'locked', label: 'Locked' },
  ];

  constructor() {
    let loadedId: number | null = null;
    effect(() => {
      const id = this.game().id;
      if (id !== loadedId) {
        loadedId = id;
        untracked(() => this.achievements.load(id));
      }
    });
  }
}
