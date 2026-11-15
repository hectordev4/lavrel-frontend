import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Two to four mutually exclusive choices side by side (Recent / Name…), each a pressed-or-not button. */
@Component({
  selector: 'app-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="segmented" role="group" [attr.aria-label]="label()">
      @for (o of options(); track o.value) {
        <button type="button" [class.on]="o.value === value()" [attr.aria-pressed]="o.value === value()" (click)="changed.emit(o.value)">
          {{ o.label }}
        </button>
      }
    </div>
  `,
  styleUrl: './segmented.scss',
})
export class Segmented<T extends string = string> {
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input.required<T>();
  /** What the choice is about, for screen readers ("Order"). */
  readonly label = input.required<string>();
  readonly changed = output<T>();
}
