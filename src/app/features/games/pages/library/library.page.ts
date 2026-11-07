import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LibrarySort } from '../../../../core/api/models/library-sort.model';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { Chip } from '../../../../shared/ui/chip/chip';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { Modal } from '../../../../shared/ui/modal/modal';
import { LIBRARY_SORT_LABELS } from '../../data-access/library-labels';
import { MyCollections } from '../../data-access/my-collections';
import { MyLibrary } from '../../data-access/my-library';
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

  protected connectSteam(): void {
    void this.accounts.link('STEAM');
  }
}
