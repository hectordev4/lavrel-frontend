import { TestBed } from '@angular/core/testing';
import { ProgressCard } from './progress-card';

function render(unlocked: number, total: number) {
  const fixture = TestBed.createComponent(ProgressCard);
  fixture.componentRef.setInput('unlocked', unlocked);
  fixture.componentRef.setInput('total', total);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ProgressCard', () => {
  it('shows unlocked of total and the percentage', () => {
    const el = render(21, 40);
    expect(el.textContent).toContain('21 of 40 achievements');
    expect(el.textContent).toContain('52%');
    expect(el.querySelector('app-perfect-diamond')).toBeNull();
  });

  it('shows the diamond at 100%', () => {
    expect(render(40, 40).querySelector('app-perfect-diamond')).not.toBeNull();
  });
});
