import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameCard } from '../../../core/api/models/game-card.model';
import { GameRow } from './game-row';
import { GameTile } from '../game-tile/game-tile';

export const sampleCard: GameCard = {
  id: 7,
  title: 'Rogue Harbor',
  slug: 'rogue-harbor',
  coverImageUrl: null,
  releaseDate: '2025-03-14',
  reviewCount: 12480,
  reviewPercentPositive: 94,
  topTags: ['Roguelike', 'Co-op'],
  modes: { singlePlayer: true, coOp: true, multiplayer: false },
  availableOn: ['PC', 'XBOX'],
};

describe('GameRow and GameTile', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('the row links by slug and shows year, rating and systems', () => {
    const fixture = TestBed.createComponent(GameRow);
    fixture.componentRef.setInput('game', sampleCard);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/games/rogue-harbor');
    expect(el.textContent).toContain('2025');
    expect(el.textContent).toContain('94%');
    expect(el.textContent).toContain('PC · XBOX');
  });

  it('the tile links by slug and shows the release month', () => {
    const fixture = TestBed.createComponent(GameTile);
    fixture.componentRef.setInput('game', sampleCard);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/games/rogue-harbor');
    expect(el.textContent).toContain('Mar 2025');
  });
});
