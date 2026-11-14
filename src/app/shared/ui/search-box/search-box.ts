import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * A search field with its magnifier icon and, once something is typed, a discreet clear button (the browser's own
 * × is hidden globally, so there is only one). Emits every change; the page decides when to search.
 */
@Component({
  selector: 'app-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="box">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z M20 20l-3.5-3.5" /></svg>
      <span class="visually-hidden">{{ label() }}</span>
      <input #box type="search" autocomplete="off" spellcheck="false" [placeholder]="placeholder()" (input)="onInput(box.value)" />
      @if (hasText()) {
        <button type="button" class="clear" aria-label="Clear search" (click)="clear(box)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg>
        </button>
      }
    </label>
  `,
  styleUrl: './search-box.scss',
})
export class SearchBox {
  /** Read by screen readers. */
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly typed = output<string>();
  protected readonly hasText = signal(false);

  protected onInput(value: string): void {
    this.hasText.set(value.length > 0);
    this.typed.emit(value);
  }

  /** Empties the field, tells the page, and keeps the focus there to type again. */
  protected clear(box: HTMLInputElement): void {
    box.value = '';
    this.onInput('');
    box.focus();
  }
}
