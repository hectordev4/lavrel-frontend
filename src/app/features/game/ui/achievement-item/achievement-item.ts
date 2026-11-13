import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Achievement } from '../../models/achievement.model';

/** One achievement: icon, name, description, worldwide and country percentages, unlock date. */
@Component({
  selector: 'app-achievement-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './achievement-item.html',
  styleUrl: './achievement-item.scss',
  host: { role: 'listitem' },
})
export class AchievementItem {
  readonly achievement = input.required<Achievement>();
  /** Signed in: shows the country figure and the unlock state. */
  readonly personal = input(false);
  readonly revealed = input(false);
  readonly reveal = output<void>();
  /** The game, for the AI guide link; null hides the Guide button (guests). */
  readonly guideFor = input<{ gameId: number; slug: string; title: string } | null>(null);

  protected readonly guideLink = computed(() => {
    const g = this.guideFor();
    return g ? `/assistant/guide/${g.gameId}/${this.achievement().id}` : null;
  });
  protected readonly guideQuery = computed(() => {
    const g = this.guideFor();
    const a = this.achievement();
    return g
      ? { name: a.name, game: g.title, slug: g.slug, hidden: a.hidden && !a.unlocked ? '1' : null }
      : null;
  });

  /** Hidden achievements stay blurred until tapped, unless already unlocked. */
  protected readonly blurred = computed(
    () => this.achievement().hidden && !this.revealed() && !this.achievement().unlocked,
  );
}
