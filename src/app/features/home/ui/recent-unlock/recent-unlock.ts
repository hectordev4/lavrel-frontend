import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isRare } from '../../../../shared/utils/rarity';
import { gameLink } from '../../../../shared/utils/game-link';
import { relativeTime } from '../../../../shared/utils/relative-time';
import { RecentUnlock as RecentUnlockModel } from '../../../../core/api/models/recent-unlock.model';

/** One recent unlock: icon, name, game (links to its page), when, and how many players have it. */
@Component({
  selector: 'app-recent-unlock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './recent-unlock.html',
  styleUrl: './recent-unlock.scss',
})
export class RecentUnlock {
  readonly unlock = input.required<RecentUnlockModel>();

  protected readonly link = computed(() => gameLink(this.unlock().gameSlug));
  protected readonly when = computed(() => relativeTime(this.unlock().unlockedAt));
  protected readonly rare = computed(() => isRare(this.unlock().globalPercent));
}
