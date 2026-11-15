import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { PickerApi, PickerGameSort } from '../../data-access/picker.api';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { AchievementGame, AchievementGamePage } from '../../models/achievement-game.model';
import { SearchBox } from '../../../../shared/ui/search-box/search-box';
import { Segmented, SegmentedOption } from '../../../../shared/ui/segmented/segmented';

/** Picker step 1: the games where you've unlocked something, to open one. */
@Component({
  selector: 'app-picker-games-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Segmented, SearchBox, RouterLink, GameCover],
  templateUrl: './picker-games.page.html',
  styleUrl: './picker-games.page.scss',
})
export class PickerGamesPage {
  private readonly api = inject(PickerApi);
  private readonly picker = inject(ShelfPicker);
  private readonly typed = new Subject<string>();
  /** Each page asked for; a newer search, order or page cancels the one still loading. */
  private readonly pages = new Subject<number>();
  private q = '';
  private page = 0;

  protected readonly orders: SegmentedOption<PickerGameSort>[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'name', label: 'Name' },
  ];
  protected readonly sort = signal<PickerGameSort>('recent');
  protected readonly games = signal<AchievementGame[]>([]);
  protected readonly hasMore = signal(false);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  constructor() {
    this.pages
      .pipe(
        switchMap((page) =>
          this.api.games(this.q, this.sort(), page).pipe(
            map((result): [number, AchievementGamePage | null] => [page, result]),
            catchError(() => of<[number, AchievementGamePage | null]>([page, null])),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([page, result]) => this.show(page, result));
    this.typed
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((q) => {
        this.q = q;
        this.load(0);
      });
    this.load(0);
  }

  protected search(text: string): void {
    this.typed.next(text.trim());
  }

  protected setSort(sort: PickerGameSort): void {
    this.sort.set(sort);
    this.load(0);
  }

  protected load(page: number): void {
    this.loading.set(true);
    this.failed.set(false);
    this.pages.next(page);
  }

  private show(page: number, result: AchievementGamePage | null): void {
    this.loading.set(false);
    if (!result) {
      this.failed.set(true);
      return;
    }
    this.page = page;
    result.games.forEach((g) => this.picker.games.set(g.gameId, g));
    this.games.update((before) => (page === 0 ? result.games : [...before, ...result.games]));
    this.hasMore.set(result.hasMore);
  }

  protected more(): void {
    this.load(this.page + 1);
  }
}
