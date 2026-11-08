import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Collection } from '../../../core/api/models/collection.model';
import { CollectionsApi } from '../../../core/api/collections.api';
import { collectionErrorMessage } from './collection-messages';

/** The member's collections for My library. Actions resolve to an error message, or null. Provided by the page. */
@Injectable()
export class MyCollections {
  private readonly api = inject(CollectionsApi);

  readonly list = signal<Collection[]>([]);
  readonly failed = signal(false);

  async reload(): Promise<void> {
    try {
      this.list.set(await firstValueFrom(this.api.list()));
      this.failed.set(false);
    } catch {
      this.failed.set(true);
    }
  }

  /** Resolves to the new collection, or an error message. */
  async create(name: string): Promise<Collection | string> {
    try {
      const created = await firstValueFrom(this.api.create(name.trim()));
      this.list.update((all) => [...all, created]);
      return created;
    } catch (error) {
      return collectionErrorMessage(error);
    }
  }

  rename(id: string, name: string): Promise<string | null> {
    return this.run(async () => {
      const renamed = await firstValueFrom(this.api.rename(id, name.trim()));
      this.list.update((all) => all.map((c) => (c.id === id ? renamed : c)));
    });
  }

  delete(id: string): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.delete(id));
      this.list.update((all) => all.filter((c) => c.id !== id));
    });
  }

  addGame(id: string, gameId: number): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.addGame(id, gameId));
      await this.reload();
    });
  }

  removeGame(id: string, gameId: number): Promise<string | null> {
    return this.run(async () => {
      await firstValueFrom(this.api.removeGame(id, gameId));
      await this.reload();
    });
  }

  private async run(work: () => Promise<void>): Promise<string | null> {
    try {
      await work();
      return null;
    } catch (error) {
      return collectionErrorMessage(error);
    }
  }
}
