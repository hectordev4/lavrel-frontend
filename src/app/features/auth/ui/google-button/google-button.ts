import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** "Continue with Google", with Google's four-colour G as their brand guidelines ask. */
@Component({
  selector: 'app-google-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './google-button.html',
  styleUrl: './google-button.scss',
})
export class GoogleButton {
  readonly busy = input(false);
  readonly disabled = input(false);
  readonly pressed = output<void>();
}
