import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecentUnlock } from './recent-unlock';

function render(globalPercent: number | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(RecentUnlock);
  fixture.componentRef.setInput('unlock', {
    achievementId: 1,
    name: 'Unbroken Thread',
    iconUrl: null,
    hidden: true,
    gameId: 7,
    gameSlug: 'ember-hollow',
    gameTitle: 'Ember Hollow',
    unlockedAt: new Date().toISOString(),
    globalPercent,
  });
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('RecentUnlock', () => {
  it('marks under 5% as rare, links by slug, and doesn’t blur your own unlock', () => {
    const el = render(4.1);
    expect(el.querySelector('a')!.classList).toContain('rare');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/games/ember-hollow');
    expect(el.textContent).toContain('Rare · 4.1% of players');
    expect(el.textContent).toContain('Unbroken Thread');
  });

  it('is not rare at 5% or more', () => {
    expect(render(38).querySelector('a')!.classList).not.toContain('rare');
  });
});
