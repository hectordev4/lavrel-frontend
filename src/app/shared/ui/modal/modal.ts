import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

let nextId = 0;

/**
 * A modal sheet built on the native <dialog>: focus stays inside; Escape, the × and a tap on the dimmed
 * page around it close it; and the page behind can't be used. Show it with [open]; it emits closed when the person dismisses it.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly open = input(false);
  readonly heading = input.required<string>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  /** Unique per modal, so several on one page each label their own dialog. */
  protected readonly headingId = `modal-heading-${nextId++}`;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) dialog.showModal();
      if (!this.open() && dialog.open) dialog.close();
    });
  }

  /** A tap on the backdrop lands on the <dialog> itself; taps inside land on the sheet. */
  protected onBackdrop(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) dialog.close();
  }

  protected onClose(): void {
    if (this.open()) this.closed.emit();
  }
}
