import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';

/**
 * /profile/shelves/:shelfId/achievements — picks up to 12 achievements for an ACHIEVEMENTS shelf, from any of
 * your games. Two steps share this frame: the games, then one game's unlocks; the picks bar stays at the bottom.
 */
@Component({
  selector: 'app-picker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, RouterOutlet],
  providers: [ShelfPicker],
  templateUrl: './picker.page.html',
  styleUrl: './picker.page.scss',
})
export class PickerPage {
  protected readonly picker = inject(ShelfPicker);
  private readonly router = inject(Router);
  protected readonly trayOpen = signal(false);
  protected readonly error = signal<string | null>(null);
  private leaving = false;

  constructor() {
    void this.picker.open(inject(ActivatedRoute).snapshot.paramMap.get('shelfId') ?? '');
  }

  protected async save(): Promise<void> {
    this.error.set(null);
    const error = await this.picker.save();
    if (error) {
      this.error.set(error);
      return;
    }
    this.leaving = true;
    await this.router.navigateByUrl('/profile');
  }

  /** Asked before leaving the picker (back, tabs…) with unsaved picks. */
  canLeave(): boolean {
    return this.leaving || !this.picker.dirty() || confirm('Leave without saving your picks?');
  }
}
