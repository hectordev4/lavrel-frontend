import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

function render(percent: number) {
  const fixture = TestBed.createComponent(ProgressBar);
  fixture.componentRef.setInput('percent', percent);
  fixture.componentRef.setInput('label', 'Achievements unlocked');
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ProgressBar', () => {
  it('exposes the value to screen readers', () => {
    const bar = render(52).querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('52');
    expect(bar.getAttribute('aria-label')).toBe('Achievements unlocked');
  });

  it.each([
    [10, 'tier-gray'],
    [35, 'tier-bronze'],
    [65, 'tier-silver'],
    [85, 'tier-gold'],
    [95, 'tier-gold-aura'],
    [100, 'tier-perfect'],
  ])('colours %i%% as %s', (percent, tierClass) => {
    expect(render(percent).querySelector('.fill')!.classList).toContain(tierClass);
  });

  it('keeps the value between 0 and 100', () => {
    expect(render(140).querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('100');
  });
});
