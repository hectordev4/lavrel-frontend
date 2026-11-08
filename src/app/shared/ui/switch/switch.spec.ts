import { TestBed } from '@angular/core/testing';
import { Switch } from './switch';

describe('Switch', () => {
  it('is a labelled switch that emits its new value', () => {
    const fixture = TestBed.createComponent(Switch);
    fixture.componentRef.setInput('label', 'Public profile');
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('role')).toBe('switch');
    const spy = vi.fn();
    fixture.componentInstance.toggled.subscribe(spy);
    input.click();
    expect(spy).toHaveBeenCalledWith(true);
  });
});
