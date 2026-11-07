import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** An on/off setting: label, optional note, and a switch announced as one (role="switch"). */
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
}
