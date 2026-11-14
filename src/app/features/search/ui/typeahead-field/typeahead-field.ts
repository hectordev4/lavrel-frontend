import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FilterOption } from '../../models/filter-option.model';

/**
 * A text field that lists matching options below it; picking one clears the field.
 * The list closes when focus leaves the field (for example into another field) or on Escape,
 * so only one list is open at a time.
 */
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

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  protected readonly open = signal(false);
  protected readonly text = signal('');

  protected onInput(value: string): void {
    this.text.set(value);
    this.open.set(true);
    this.query.emit(value);
  }

  protected onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    if (!host.contains(event.relatedTarget as Node | null)) this.open.set(false);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected clear(): void {
    const field = this.field().nativeElement;
    field.value = '';
    this.onInput('');
    field.focus();
  }

  /** Keeps focus in the text field while tapping an option, so the list doesn't close first. */
  protected keepFocus(event: Event): void {
    event.preventDefault();
  }

  protected pick(option: FilterOption): void {
    this.picked.emit(option);
    this.field().nativeElement.value = '';
    this.text.set('');
    this.open.set(false);
  }
}
