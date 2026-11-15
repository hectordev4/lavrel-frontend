import { Injectable, computed, inject, signal } from '@angular/core';
import { LibraryGame } from '../../../core/api/models/library-game.model';
import { Collection } from '../../../core/api/models/collection.model';
import { MyCollections } from './my-collections';
import { MyLibrary } from './my-library';

/**
 * What My library's collection parts share: which collection is open, the open sheets, the last message, and
 * every collection action. Provided by the library page, used by the collections bar and each game's menu.
 */
@Injectable()
export class CollectionsUi {
  private readonly library = inject(MyLibrary);
  readonly collections = inject(MyCollections);

  /** The collection being browsed, or null for all games. */
  readonly current = computed(() => {
    const id = this.library.query().collection;
    return id ? (this.collections.list().find((c) => c.id === id) ?? null) : null;
  });
  readonly creating = signal(false);
  readonly renaming = signal(false);
  /** The game whose "Add to collection" sheet is open. */
  readonly adding = signal<LibraryGame | null>(null);
  readonly formError = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  browse(collectionId: string | null): void {
    this.message.set(null);
    this.library.setQuery({ collection: collectionId });
  }

  openCreate(): void {
    this.formError.set(null);
    this.creating.set(true);
  }

  async create(name: string): Promise<void> {
    if (!name.trim()) {
      this.formError.set('Give the collection a name.');
      return;
    }
    const result = await this.collections.create(name);
    if (typeof result === 'string') {
      this.formError.set(result);
      return;
    }
    this.creating.set(false);
    this.browse(result.id);
  }

  openRename(): void {
    this.formError.set(null);
    this.renaming.set(true);
  }

  async rename(name: string): Promise<void> {
    const c = this.current();
    if (!c) return;
    if (!name.trim()) {
      this.formError.set('Give the collection a name.');
      return;
    }
    const error = await this.collections.rename(c.id, name);
    if (error) this.formError.set(error);
    else this.renaming.set(false);
  }

  async deleteCurrent(): Promise<void> {
    const c = this.current();
    if (!c || !confirm(`Delete the collection ${c.name}? Its games stay in your library.`)) return;
    const error = await this.collections.delete(c.id);
    if (error) this.message.set(error);
    else this.browse(null);
  }

  async addTo(collection: Collection): Promise<void> {
    const game = this.adding();
    if (!game) return;
    const error = await this.collections.addGame(collection.id, game.gameId);
    this.adding.set(null);
    this.message.set(error ?? `Added ${game.title} to ${collection.name}.`);
  }

  async removeFromCurrent(game: LibraryGame): Promise<void> {
    const c = this.current();
    if (!c) return;
    const error = await this.collections.removeGame(c.id, game.gameId);
    this.message.set(error ?? `Removed ${game.title} from ${c.name}.`);
    if (!error) this.library.reload();
  }
}
