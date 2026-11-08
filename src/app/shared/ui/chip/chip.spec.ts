import { TestBed } from '@angular/core/testing';
import { Chip } from './chip';

function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(Chip);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return { fixture, button: fixture.nativeElement.querySelector('button') as HTMLButtonElement };
}

describe('Chip', () => {
  it('works as a toggle with aria-pressed and a count', () => {
    const { button } = render({ label: 'Playing', pressed: true, count: 4 });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('Playing');
    expect(button.textContent).toContain('4');
  });

  it('as a removable filter it announces "Remove …"', () => {
    const { button } = render({ label: 'Roguelike', removable: true });
    expect(button.getAttribute('aria-label')).toBe('Remove Roguelike');
    expect(button.hasAttribute('aria-pressed')).toBe(false);
  });

  it('emits activate on click', () => {
    const { fixture, button } = render({ label: 'Co-op' });
    const spy = vi.fn();
    fixture.componentInstance.activate.subscribe(spy);
    button.click();
    expect(spy).toHaveBeenCalledOnce();
  });
});
