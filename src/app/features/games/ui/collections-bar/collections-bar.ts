import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Chip } from '../../../../shared/ui/chip/chip';
import { Modal } from '../../../../shared/ui/modal/modal';
import { CollectionsUi } from '../../data-access/collections-ui';

/**
 * My library's collections: the chips (All games and each collection), New collection, the open collection's
 * Rename and Delete, the last message, and the sheets to create, rename and add a game.
 */
@Component({
  selector: 'app-collections-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chip, Modal],
  templateUrl: './collections-bar.html',
  styleUrl: './collections-bar.scss',
})
export class CollectionsBar {
  protected readonly ui = inject(CollectionsUi);
}
