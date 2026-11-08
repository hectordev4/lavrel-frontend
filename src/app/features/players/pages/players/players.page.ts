import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayerSearch } from '../../data-access/player-search';
import { PlayerRow } from '../../ui/player-row/player-row';

/** /players: find someone's public profile by name or player id. */
@Component({
  selector: 'app-players-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PlayerRow],
  providers: [PlayerSearch],
  templateUrl: './players.page.html',
  styleUrl: './players.page.scss',
})
export class PlayersPage {
  protected readonly search = inject(PlayerSearch);
  protected readonly text = signal('');

  protected onInput(value: string): void {
    this.text.set(value);
    this.search.type(value);
  }
}
