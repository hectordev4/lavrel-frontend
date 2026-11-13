import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** A search field with its magnifier icon. Emits every change; the page decides when to search. */
@Component({
  selector: 'app-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="box">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z M20 20l-3.5-3.5" /></svg>
      <span class="visually-hidden">{{ label() }}</span>
      <input #box type="search" autocomplete="off" spellcheck="false" [placeholder]="placeholder()" (input)="typed.emit(box.value)" />
    </label>
  `,
  styleUrl: './search-box.scss',
})
export class SearchBox {
  /** Read by screen readers. */
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly typed = output<string>();
}
