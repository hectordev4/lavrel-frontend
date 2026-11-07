import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * A pill button. As a toggle (pressed set), it shows whether it is on; as a removable
 * filter (removable set), it shows an × and announces "Remove …".
 */
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  readonly label = input.required<string>();
  readonly count = input<number | null>(null);
  readonly pressed = input<boolean | null>(null);
  readonly removable = input(false);
  readonly activate = output<void>();

  protected readonly ariaLabel = computed(() => (this.removable() ? `Remove ${this.label()}` : null));
  protected readonly on = computed(() => this.pressed() === true || this.removable());
}
