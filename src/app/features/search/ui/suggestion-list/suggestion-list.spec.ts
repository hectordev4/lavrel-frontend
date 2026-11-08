import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SuggestionList } from './suggestion-list';

describe('SuggestionList', () => {
  it('groups games, tags and franchises with the right links', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SuggestionList);
    fixture.componentRef.setInput('results', {
      games: [{ id: 1, title: 'Rogue Harbor', slug: 'rogue-harbor', releaseDate: '2025-01-01' }],
      tags: [{ id: 1716, name: 'Roguelike', gameCount: 40 }],
      franchises: [],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links[0]).toBe('/games/rogue-harbor');
    expect(decodeURIComponent(links[1]!)).toBe('/search/results?tag=1716:Roguelike');
    expect([...el.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(['Games', 'Tags']);
  });
});
