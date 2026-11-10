import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * An on/off setting: label, optional note, and a switch announced as one (role="switch").
 * It shows the checked input, not the tap: the page decides the value (and can switch it back).
 */
@Component({
  selector: 'app-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
})
export class Switch {
  readonly label = input.required<string>();
  readonly note = input('');
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly toggled = output<boolean>();

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const wanted = input.checked;
    input.checked = this.checked();
    this.toggled.emit(wanted);
  }
}
