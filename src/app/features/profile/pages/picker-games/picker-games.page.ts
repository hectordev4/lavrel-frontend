import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { PickerApi, PickerGameSort } from '../../data-access/picker.api';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { AchievementGame } from '../../models/achievement-game.model';

/** Picker step 1: the games where you've unlocked something, to open one. */
@Component({
  selector: 'app-picker-games-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover],
  templateUrl: './picker-games.page.html',
  styleUrl: './picker-games.page.scss',
})
export class PickerGamesPage {
  private readonly api = inject(PickerApi);
  private readonly picker = inject(ShelfPicker);
  private readonly typed = new Subject<string>();
  private q = '';
  private page = 0;

  protected readonly sort = signal<PickerGameSort>('recent');
  protected readonly games = signal<AchievementGame[]>([]);
  protected readonly hasMore = signal(false);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  constructor() {
    this.typed.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef))).subscribe((q) => {
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
    this.api.games(this.q, this.sort(), page).subscribe({
      next: (result) => {
        this.page = page;
        result.games.forEach((g) => this.picker.games.set(g.gameId, g));
        this.games.update((before) => (page === 0 ? result.games : [...before, ...result.games]));
        this.hasMore.set(result.hasMore);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected more(): void {
    this.load(this.page + 1);
  }
}
