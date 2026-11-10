import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { GameRow } from '../../../../shared/ui/game-row/game-row';
import { GameTile } from '../../../../shared/ui/game-tile/game-tile';
import { Discover } from '../../data-access/discover';

/** Home for people browsing without an account: search, a sign-in invite, popular and new games. */
@Component({
  selector: 'app-guest-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard, GameRow, GameTile],
  providers: [Discover],
  templateUrl: './guest-home.page.html',
  styleUrl: './guest-home.page.scss',
})
export class GuestHomePage {
  protected readonly discover = inject(Discover);

  constructor() {
    this.discover.loadAll();
  }
}
