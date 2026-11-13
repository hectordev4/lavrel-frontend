import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LibrarySort } from '../../../../core/api/models/library-sort.model';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { ConnectSteamCard } from '../../../../shared/ui/connect-steam-card/connect-steam-card';
import { SearchBox } from '../../../../shared/ui/search-box/search-box';
import { SelectField } from '../../../../shared/ui/select-field/select-field';
import { CollectionsUi } from '../../data-access/collections-ui';
import { LIBRARY_SORT_LABELS, isLibrarySort } from '../../data-access/library-labels';
import { MyCollections } from '../../data-access/my-collections';
import { MyLibrary } from '../../data-access/my-library';
import { CollectionsBar } from '../../ui/collections-bar/collections-bar';
import { LibraryCard } from '../../ui/library-card/library-card';
import { LibraryGameMenu } from '../../ui/library-game-menu/library-game-menu';

/** /library: the games the member owns on linked accounts, with a name filter, five sorts and paging. */
@Component({
  selector: 'app-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConnectSteamCard, SearchBox, SelectField, LibraryCard, CollectionsBar, LibraryGameMenu],
  providers: [MyLibrary, MyCollections, CollectionsUi],
  templateUrl: './library.page.html',
  styleUrl: './library.page.scss',
})
export class LibraryPage {
  protected readonly library = inject(MyLibrary);
  protected readonly accounts = inject(PlatformAccounts);
  protected readonly sortOptions = (Object.keys(LIBRARY_SORT_LABELS) as LibrarySort[]).map(
    (value) => ({
      value,
      label: LIBRARY_SORT_LABELS[value],
    }),
  );
  protected readonly collectionsUi = inject(CollectionsUi);
  private readonly typed = new Subject<string>();

  constructor() {
    this.accounts.ensureLoaded();
    this.library.reload();
    void inject(MyCollections).reload();
    this.typed
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((q) => this.library.setQuery({ q }));
  }

  protected setSort(value: string): void {
    if (isLibrarySort(value)) this.library.setQuery({ sort: value });
  }

  protected onType(value: string): void {
    this.typed.next(value);
  }

  protected connectSteam(): void {
    void this.accounts.connect('STEAM');
  }
}
