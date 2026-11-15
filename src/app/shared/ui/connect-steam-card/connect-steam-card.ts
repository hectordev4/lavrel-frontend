import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CtaCard } from '../cta-card/cta-card';

/** The "Connect your Steam account" card. Presentational: the page passes what happens on Connect Steam. */
@Component({
  selector: 'app-connect-steam-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CtaCard],
  template: `
    <app-cta-card heading="Connect your Steam account" [text]="text()">
      <button type="button" class="btn btn-primary" [disabled]="busy()" (click)="connect.emit()">Connect Steam</button>
    </app-cta-card>
  `,
})
export class ConnectSteamCard {
  readonly text = input(
    'You’ll sign in on Steam, then we bring in your games and every achievement you’ve unlocked. Your Steam game details need to be public.',
  );
  /** True while the Steam login address is being fetched. */
  readonly busy = input(false);
  readonly connect = output<void>();
}
