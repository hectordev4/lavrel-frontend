import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LibraryGame } from '../../../../core/api/models/library-game.model';
import { DismissableMenu } from '../../../../shared/ui/menu/dismissable-menu';
import { CollectionsUi } from '../../data-access/collections-ui';

/** One game's ⋯ menu in My library: Add to collection (or create one first) and Remove from the open collection. */
@Component({
  selector: 'app-library-game-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DismissableMenu],
  templateUrl: './library-game-menu.html',
  styleUrl: './library-game-menu.scss',
})
export class LibraryGameMenu {
  readonly game = input.required<LibraryGame>();
  protected readonly ui = inject(CollectionsUi);
}
