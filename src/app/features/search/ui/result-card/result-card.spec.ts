import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResultCard } from './result-card';

describe('ResultCard', () => {
  it('shows modes, reviews, systems and tags, linking by slug', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ResultCard);
    fixture.componentRef.setInput('game', {
      id: 7,
      title: 'Rogue Harbor',
      slug: 'rogue-harbor',
      coverImageUrl: null,
      releaseDate: '2025-03-14',
      reviewCount: 12480,
      reviewPercentPositive: 94,
      topTags: ['Roguelike', 'Pirates'],
      modes: { singlePlayer: true, coOp: true, multiplayer: false },
      availableOn: ['PC', 'PLAYSTATION'],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.title')!.getAttribute('href')).toBe('/games/rogue-harbor');
    expect(el.textContent).toContain('Single-player, Co-op');
    expect(el.textContent).toContain('12,480 reviews');
    expect(el.textContent).toContain('PC · PlayStation');
    expect([...el.querySelectorAll('.tags li')].map((li) => li.textContent)).toEqual(['Roguelike', 'Pirates']);
  });
});
