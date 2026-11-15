import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** A compact select with its arrow (sorts). Emits the chosen value as a string; the page checks it. */
@Component({
  selector: 'app-select-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="sort">
      <span class="visually-hidden">{{ label() }}</span>
      <select #select (change)="changed.emit(select.value)">
        @for (o of options(); track o.value) {
          <option [value]="o.value" [selected]="o.value === value()">{{ o.label }}</option>
        }
      </select>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </label>
  `,
  styleUrl: './select-field.scss',
})
export class SelectField {
  readonly options = input.required<{ value: string; label: string }[]>();
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly changed = output<string>();
}
