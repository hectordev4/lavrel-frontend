import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { libraryGame } from '../../../../../testing/fixtures';
import { LibraryCard } from './library-card';

function render(game = libraryGame(1)) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(LibraryCard);
  fixture.componentRef.setInput('game', game);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('LibraryCard', () => {
  it('shows unlocked of total and playtime', () => {
    const el = render();
    expect(el.textContent).toContain('5/10');
    expect(el.textContent).toContain('2 h');
    expect(el.querySelector('.title')!.getAttribute('href')).toBe('/games/game-1');
  });

  it('shows the diamond when complete, and no bar without achievements', () => {
    expect(
      render(libraryGame(1, { unlocked: 10 })).querySelector('app-perfect-diamond'),
    ).not.toBeNull();
    TestBed.resetTestingModule();
    expect(
      render(libraryGame(1, { total: 0, unlocked: 0 })).querySelector('app-progress-bar'),
    ).toBeNull();
  });
});
