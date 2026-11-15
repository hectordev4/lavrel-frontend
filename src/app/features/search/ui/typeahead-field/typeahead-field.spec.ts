import { TestBed } from '@angular/core/testing';
import { TypeaheadField } from './typeahead-field';

function render() {
  const fixture = TestBed.createComponent(TypeaheadField);
  fixture.componentRef.setInput('label', 'Developer');
  fixture.componentRef.setInput('options', [{ id: 1, name: 'Valve', gameCount: 12 }]);
  fixture.detectChanges();
  return fixture;
}

describe('TypeaheadField', () => {
  it('opens on input, picks an option, clears and closes', () => {
    const fixture = render();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    const picked = vi.fn();
    fixture.componentInstance.picked.subscribe(picked);

    input.value = 'va';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('.option') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(picked).toHaveBeenCalledWith({ id: 1, name: 'Valve', gameCount: 12 });
    expect(input.value).toBe('');
    expect(el.querySelector('.options')).toBeNull();
  });

  it('shows a clear button with text, and closes when focus leaves', () => {
    const fixture = render();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    input.value = 'va';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('.clear')).not.toBeNull();
    el.querySelector('.field-wrap')!.dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: null }),
    );
    fixture.detectChanges();
    expect(el.querySelector('.options')).toBeNull();
  });
});
