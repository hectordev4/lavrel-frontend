import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackingStatus } from '../../../../core/api/models/tracking-status.model';
import { AuthStore } from '../../../../core/auth/auth.store';
import { TrackedGames } from '../../../../core/tracking/tracked-games';
import { TrackControl } from '../../../../shared/ui/track-control/track-control';
import { GameDetails } from '../../models/game-details.model';

/** The game page's own actions: track, change status, stop tracking, pin, and Ask the AI about this game. */
@Component({
  selector: 'app-game-tracking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TrackControl],
  templateUrl: './game-tracking.html',
  styleUrl: './game-tracking.scss',
})
export class GameTracking {
  readonly game = input.required<Pick<GameDetails, 'id' | 'title' | 'slug'>>();

  protected readonly tracked = inject(TrackedGames);
  protected readonly signedIn = inject(AuthStore).isVerified;
  protected readonly trackMessage = signal<string | null>(null);
  /** This game in the member's tracking list, or undefined. */
  protected readonly trackedEntry = computed(() => this.tracked.byGameId().get(this.game().id));

  constructor() {
    this.tracked.ensureLoaded();
  }

  protected async track(status: TrackingStatus): Promise<void> {
    this.trackMessage.set(await this.tracked.track(this.game().id, status));
  }

  protected async untrack(): Promise<void> {
    if (!confirm(`Stop tracking ${this.game().title}?`)) return;
    this.trackMessage.set(await this.tracked.untrack(this.game().id));
  }

  protected async togglePin(): Promise<void> {
    const entry = this.trackedEntry();
    if (!entry) return;
    const id = this.game().id;
    this.trackMessage.set(
      entry.pinPosition === null ? await this.tracked.pin(id) : await this.tracked.unpin(id),
    );
  }
}
