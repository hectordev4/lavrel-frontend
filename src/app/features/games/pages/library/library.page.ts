import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LibrarySort } from '../../../../core/api/models/library-sort.model';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { LIBRARY_SORT_LABELS } from '../../data-access/library-labels';
import { MyLibrary } from '../../data-access/my-library';
import { LibraryCard } from '../../ui/library-card/library-card';

/** /games/library: the games the member owns on linked accounts, with a name filter, five sorts and paging. */
@Component({
  selector: 'app-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard, LibraryCard],
  providers: [MyLibrary],
  templateUrl: './library.page.html',
  styleUrl: './library.page.scss',
})
export class LibraryPage {
  protected readonly library = inject(MyLibrary);
  protected readonly accounts = inject(PlatformAccounts);
  protected readonly sortOptions = (Object.keys(LIBRARY_SORT_LABELS) as LibrarySort[]).map((value) => ({
    value,
    label: LIBRARY_SORT_LABELS[value],
  }));
  private readonly typed = new Subject<string>();

  constructor() {
    this.accounts.ensureLoaded();
    this.library.reload();
    this.typed
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((q) => this.library.setQuery({ q }));
  }

  protected onType(value: string): void {
    this.typed.next(value);
  }

  protected connectSteam(): void {
    void this.accounts.link('STEAM');
  }
}
