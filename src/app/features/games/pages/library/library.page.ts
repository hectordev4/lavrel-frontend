import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LibraryGame } from '../../../../core/api/models/library-game.model';
import { LibrarySort } from '../../../../core/api/models/library-sort.model';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { Chip } from '../../../../shared/ui/chip/chip';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { Modal } from '../../../../shared/ui/modal/modal';
import { LIBRARY_SORT_LABELS } from '../../data-access/library-labels';
import { MyCollections } from '../../data-access/my-collections';
import { MyLibrary } from '../../data-access/my-library';
import { Collection } from '../../models/collection.model';
import { LibraryCard } from '../../ui/library-card/library-card';

/** /games/library: the games the member owns on linked accounts, with a name filter, five sorts and paging. */
@Component({
  selector: 'app-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Chip, CtaCard, LibraryCard, Modal],
  providers: [MyLibrary, MyCollections],
  templateUrl: './library.page.html',
  styleUrl: './library.page.scss',
})
export class LibraryPage {
  protected readonly library = inject(MyLibrary);
  protected readonly accounts = inject(PlatformAccounts);
  protected readonly collections = inject(MyCollections);
  /** The collection being browsed, or null for all games. */
  protected readonly current = computed(() => {
    const id = this.library.query().collection;
    return id ? (this.collections.list().find((c) => c.id === id) ?? null) : null;
  });
  protected readonly creating = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly renaming = signal(false);
  /** The game whose "Add to collection" sheet is open. */
  protected readonly adding = signal<LibraryGame | null>(null);
  protected readonly sortOptions = (Object.keys(LIBRARY_SORT_LABELS) as LibrarySort[]).map((value) => ({
    value,
    label: LIBRARY_SORT_LABELS[value],
  }));
  private readonly typed = new Subject<string>();

  constructor() {
    this.accounts.ensureLoaded();
    this.library.reload();
    void this.collections.reload();
    this.typed
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((q) => this.library.setQuery({ q }));
  }

  protected onType(value: string): void {
    this.typed.next(value);
  }

  protected browse(collectionId: string | null): void {
    this.message.set(null);
    this.library.setQuery({ collection: collectionId });
  }

  protected openCreate(): void {
    this.formError.set(null);
    this.creating.set(true);
  }

  protected async create(name: string): Promise<void> {
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

  protected openRename(): void {
    this.formError.set(null);
    this.renaming.set(true);
  }

  protected async rename(name: string): Promise<void> {
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

  protected async deleteCurrent(): Promise<void> {
    const c = this.current();
    if (!c || !confirm(`Delete the collection ${c.name}? Its games stay in your library.`)) return;
    const error = await this.collections.delete(c.id);
    if (error) this.message.set(error);
    else this.browse(null);
  }

  protected async addTo(collection: Collection): Promise<void> {
    const game = this.adding();
    if (!game) return;
    const error = await this.collections.addGame(collection.id, game.gameId);
    this.adding.set(null);
    this.message.set(error ?? `Added ${game.title} to ${collection.name}.`);
  }

  protected async removeFromCurrent(game: LibraryGame): Promise<void> {
    const c = this.current();
    if (!c) return;
    const error = await this.collections.removeGame(c.id, game.gameId);
    this.message.set(error ?? `Removed ${game.title} from ${c.name}.`);
    if (!error) this.library.reload();
  }

  protected closeMenu(event: Event): void {
    (event.target as HTMLElement).closest('details')?.removeAttribute('open');
  }

  protected connectSteam(): void {
    void this.accounts.link('STEAM');
  }
}
