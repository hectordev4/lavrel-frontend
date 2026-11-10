import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackingStatus } from '../../../core/api/models/tracking-status.model';
import { TRACKING_STATUSES, TRACKING_STATUS_LABELS } from '../../../core/tracking/tracking-labels';

const STOP = 'STOP';

/**
 * Track a game, change its status, stop tracking, and (full variant) pin it to Home.
 * Presentational: the page wires it to TrackedGames. Guests get a "Sign in to track" link.
 */
@Component({
  selector: 'app-track-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './track-control.html',
  styleUrl: './track-control.scss',
})
export class TrackControl {
  readonly gameTitle = input.required<string>();
  /** null when the game isn't tracked. */
  readonly status = input<TrackingStatus | null>(null);
  readonly pinned = input(false);
  readonly busy = input(false);
  readonly signedIn = input(false);
  /** full: status and pin (game page); compact: status only (result cards). */
  readonly variant = input<'full' | 'compact'>('full');

  readonly track = output<TrackingStatus>();
  readonly untrack = output<void>();
  readonly pinToggle = output<void>();

  protected readonly stop = STOP;
  protected readonly options = TRACKING_STATUSES.map((value) => ({ value, label: TRACKING_STATUS_LABELS[value] }));
  protected readonly statusLabel = computed(() => {
    const s = this.status();
    return s ? TRACKING_STATUS_LABELS[s] : '';
  });

  protected onSelect(value: string, select: HTMLSelectElement): void {
    if (value === STOP) {
      select.value = this.status() ?? '';
      this.untrack.emit();
    } else {
      this.track.emit(value as TrackingStatus);
    }
  }
}
