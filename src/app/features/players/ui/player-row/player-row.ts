import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { PublicProfileHeader } from '../../models/public-profile.model';

/** A player in search results: avatar, name, player id and country, linking to their profile. */
@Component({
  selector: 'app-player-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar],
  templateUrl: './player-row.html',
  styleUrl: './player-row.scss',
})
export class PlayerRow {
  readonly player = input.required<PublicProfileHeader>();

  protected readonly id = computed(() => String(this.player().publicId));
  protected readonly spacedId = computed(() => this.id().replace(/(\d{4})(?=\d)/g, '$1 '));
}
