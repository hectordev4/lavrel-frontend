import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FilterOption } from '../../models/filter-option.model';

/** A text field that lists matching options below it; picking one clears the field. */
@Component({
  selector: 'app-typeahead-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './typeahead-field.html',
  styleUrl: './typeahead-field.scss',
})
export class TypeaheadField {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly options = input<FilterOption[]>([]);
  readonly loading = input(false);
  readonly failed = input(false);
  readonly disabled = input(false);
  readonly query = output<string>();
  readonly picked = output<FilterOption>();

  protected readonly open = signal(false);

  protected onInput(value: string): void {
    this.open.set(true);
    this.query.emit(value);
  }

  protected pick(option: FilterOption, field: HTMLInputElement): void {
    this.picked.emit(option);
    field.value = '';
    this.open.set(false);
  }
}
