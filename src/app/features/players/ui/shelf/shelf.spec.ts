import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shelf } from './shelf';

function render(shelf: object) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Shelf);
  fixture.componentRef.setInput('shelf', { id: 's', title: null, collectionName: null, games: null, achievements: null, stats: null, ...shelf });
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Shelf', () => {
  it('leaves the library size out when the owner hides it', () => {
    const el = render({ type: 'STATS', stats: { gamesOwned: null, achievementsUnlocked: 212, gamesCompleted: 3 } });
    expect(el.textContent).not.toContain('Games');
    expect(el.textContent).toContain('212');
  });

  it('marks rare achievements in gold', () => {
    const el = render({ type: 'ACHIEVEMENTS', achievements: [{ name: 'Rare one', iconUrl: null, globalPercent: 2.7 }] });
    expect(el.querySelector('li')!.classList).toContain('rare');
    expect(el.textContent).toContain('Rare · 2.7%');
  });

  it('links games by slug', () => {
    const el = render({ type: 'PLAYING', games: [{ gameId: 1, title: 'Hades', slug: 'hades', coverImageUrl: null }] });
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/games/hades');
    expect(el.querySelector('h2')!.textContent).toBe('Playing now');
  });
});
