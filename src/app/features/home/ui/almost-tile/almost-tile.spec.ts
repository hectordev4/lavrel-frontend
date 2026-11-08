import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { libraryGame } from '../../../../../testing/fixtures';
import { AlmostTile } from './almost-tile';

describe('AlmostTile', () => {
  it('says how many are left', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AlmostTile);
    fixture.componentRef.setInput('game', libraryGame(1, { unlocked: 47, total: 48 }));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('97% · 1 left');
  });
});
