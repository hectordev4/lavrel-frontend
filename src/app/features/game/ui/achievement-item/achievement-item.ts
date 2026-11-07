import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Achievement } from '../../models/achievement.model';

/** One achievement: icon, name, description, worldwide and country percentages, unlock date. */
@Component({
  selector: 'app-achievement-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
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

  /** Hidden achievements stay blurred until tapped, unless already unlocked. */
  protected readonly blurred = computed(
    () => this.achievement().hidden && !this.revealed() && !this.achievement().unlocked,
  );
}
