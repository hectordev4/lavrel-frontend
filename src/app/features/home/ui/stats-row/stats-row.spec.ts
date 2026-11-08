import { TestBed } from '@angular/core/testing';
import { StatsRow } from './stats-row';

function render(averageCompletion: number | null) {
  const fixture = TestBed.createComponent(StatsRow);
  fixture.componentRef.setInput('stats', { achievementsUnlocked: 1240, averageCompletion, perfectGames: 6, gamesOwned: 212 });
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent!;
}

describe('StatsRow', () => {
  it('shows the totals', () => {
    const text = render(47.3);
    expect(text).toContain('1,240');
    expect(text).toContain('47%');
    expect(text).toContain('6');
  });

  it('shows — before any unlock', () => {
    expect(render(null)).toContain('—');
  });
});
