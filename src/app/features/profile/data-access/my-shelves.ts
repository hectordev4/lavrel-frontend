import { Injectable, inject, signal } from '@angular/core';
import { LatestOnly } from '../../../core/util/latest-only';
import { firstValueFrom } from 'rxjs';
import { ShelfType } from '../../../core/profile/shelf-types';
import { MyShelf } from '../models/my-shelf.model';
import { ShelvesApi } from './shelves.api';
import { shelfErrorMessage } from './shelf-messages';

/** My shelves in order, and every change to them. Actions resolve to an error message, or null. */
@Injectable()
export class MyShelves {
  private readonly api = inject(ShelvesApi);

  readonly list = signal<MyShelf[]>([]);
  readonly failed = signal(false);
  private readonly latest = new LatestOnly();

  async reload(): Promise<void> {
    const isLatest = this.latest.start();
    try {
      const list = sorted(await firstValueFrom(this.api.list()));
      if (!isLatest()) return;
      this.list.set(list);
      this.failed.set(false);
    } catch {
      if (isLatest()) this.failed.set(true);
    }
  }

  add(type: ShelfType, title: string, collectionId: string | null): Promise<string | null> {
    return this.run(async () => {
      const shelf = await firstValueFrom(this.api.add(type, title.trim() || null, collectionId));
      this.list.update((all) => sorted([...all, shelf]));
    });
  }

  retitle(id: string, title: string): Promise<string | null> {
    return this.run(async () => {
      const shelf = await firstValueFrom(this.api.retitle(id, title.trim() || null));
      this.list.update((all) => all.map((s) => (s.id === id ? shelf : s)));
    });
  }

  remove(id: string): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.remove(id));
      this.list.update((all) => all.filter((s) => s.id !== id));
    });
  }

  /** A new order from drag and drop: shown at once, put back if the save fails. */
  async reorder(ids: string[]): Promise<string | null> {
    const before = this.list();
    const byId = new Map(before.map((s) => [s.id, s]));
    this.list.set(ids.map((id, i) => ({ ...byId.get(id)!, position: i + 1 })));
    const error = await this.run(async () =>
      this.list.set(sorted(await firstValueFrom(this.api.reorder(ids)))),
    );
    if (error) this.list.set(before);
    return error;
  }

  /** Moves a shelf one place up (-1) or down (+1), for the keyboard. */
  move(id: string, step: -1 | 1): Promise<string | null> {
    const ids = this.list().map((s) => s.id);
    const from = ids.indexOf(id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= ids.length) return Promise.resolve(null);
    [ids[from], ids[to]] = [ids[to], ids[from]];
    return this.run(async () => this.list.set(sorted(await firstValueFrom(this.api.reorder(ids)))));
  }

  showAchievements(id: string, achievementIds: number[]): Promise<string | null> {
    return this.run(async () => {
      const shelf = await firstValueFrom(this.api.showAchievements(id, achievementIds));
      this.list.update((all) => all.map((s) => (s.id === id ? shelf : s)));
    });
  }

  private async run(work: () => Promise<void>): Promise<string | null> {
    try {
      await work();
      return null;
    } catch (error) {
      return shelfErrorMessage(error);
    }
  }
}

function sorted(shelves: MyShelf[]): MyShelf[] {
  return [...shelves].sort((a, b) => a.position - b.position);
}
