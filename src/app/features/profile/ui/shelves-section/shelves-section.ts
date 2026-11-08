import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CollectionsApi } from '../../../../core/api/collections.api';
import { MemberOverviewApi } from '../../../../core/api/member-overview.api';
import { Collection } from '../../../../core/api/models/collection.model';
import { RecentUnlock } from '../../../../core/api/models/recent-unlock.model';
import {
  MAX_SHELF_ACHIEVEMENTS,
  MAX_SHELVES,
  SHELF_TYPES,
  SHELF_TYPE_HINTS,
  SHELF_TYPE_NAMES,
  ShelfType,
} from '../../../../core/profile/shelf-types';
import { Modal } from '../../../../shared/ui/modal/modal';
import { MyShelves } from '../../data-access/my-shelves';
import { MyShelf } from '../../models/my-shelf.model';

type Sheet = { kind: 'add' } | { kind: 'title'; shelf: MyShelf } | { kind: 'achievements'; shelf: MyShelf } | null;

/** Profile tab: the shelves my public profile shows, to add, title, order, remove, and fill with achievements. */
@Component({
  selector: 'app-shelves-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  providers: [MyShelves],
  templateUrl: './shelves-section.html',
  styleUrl: './shelves-section.scss',
})
export class ShelvesSection {
  protected readonly shelves = inject(MyShelves);
  private readonly collectionsApi = inject(CollectionsApi);
  private readonly overviewApi = inject(MemberOverviewApi);

  protected readonly sheet = signal<Sheet>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly unlocks = signal<RecentUnlock[]>([]);
  protected readonly picked = signal<number[]>([]);
  protected readonly newType = signal<ShelfType>('RECENTLY_PLAYED');
  protected readonly chosenCollection = signal('');

  protected readonly max = MAX_SHELVES;
  protected readonly maxAchievements = MAX_SHELF_ACHIEVEMENTS;
  protected readonly names = SHELF_TYPE_NAMES;
  protected readonly hints = SHELF_TYPE_HINTS;
  protected readonly full = computed(() => this.shelves.list().length >= MAX_SHELVES);
  /** Types still possible: collections can repeat, the others only once. */
  protected readonly addable = computed(() => {
    const used = new Set(this.shelves.list().map((s) => s.type));
    return SHELF_TYPES.filter((t) => t === 'COLLECTION' || !used.has(t));
  });

  constructor() {
    void this.shelves.reload();
  }

  protected label(shelf: MyShelf): string {
    if (shelf.title) return shelf.title;
    if (shelf.type === 'COLLECTION') {
      return this.collections().find((c) => c.id === shelf.collectionId)?.name ?? SHELF_TYPE_NAMES.COLLECTION;
    }
    return SHELF_TYPE_NAMES[shelf.type];
  }

  protected async openAdd(): Promise<void> {
    this.formError.set(null);
    this.newType.set(this.addable()[0] ?? 'COLLECTION');
    this.chosenCollection.set('');
    this.collections.set(await firstValueFrom(this.collectionsApi.list()).catch(() => []));
    this.sheet.set({ kind: 'add' });
  }

  protected async add(title: string): Promise<void> {
    const type = this.newType();
    const collectionId = this.chosenCollection();
    if (type === 'COLLECTION' && !collectionId) {
      this.formError.set('Pick the collection to show.');
      return;
    }
    await this.save(() => this.shelves.add(type, title, type === 'COLLECTION' ? collectionId : null));
  }

  protected async retitle(shelf: MyShelf, title: string): Promise<void> {
    await this.save(() => this.shelves.retitle(shelf.id, title));
  }

  protected async remove(shelf: MyShelf): Promise<void> {
    if (!confirm(`Remove the shelf ${this.label(shelf)} from your profile?`)) return;
    this.message.set(await this.shelves.remove(shelf.id));
  }

  protected async move(shelf: MyShelf, step: -1 | 1): Promise<void> {
    this.message.set(await this.shelves.move(shelf.id, step));
  }

  protected async openAchievements(shelf: MyShelf): Promise<void> {
    this.formError.set(null);
    this.picked.set([...shelf.achievementIds]);
    this.unlocks.set(await firstValueFrom(this.overviewApi.recentUnlocks(20)).catch(() => []));
    this.sheet.set({ kind: 'achievements', shelf });
  }

  protected toggle(id: number): void {
    this.picked.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= MAX_SHELF_ACHIEVEMENTS ? ids : [...ids, id],
    );
  }

  protected async saveAchievements(shelf: MyShelf): Promise<void> {
    await this.save(() => this.shelves.showAchievements(shelf.id, this.picked()));
  }

  private async save(work: () => Promise<string | null>): Promise<void> {
    this.busy.set(true);
    const error = await work();
    this.busy.set(false);
    if (error) this.formError.set(error);
    else this.sheet.set(null);
  }
}
