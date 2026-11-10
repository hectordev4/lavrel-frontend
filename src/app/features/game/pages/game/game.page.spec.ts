import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { achievement, gameDetails } from '../../../../../testing/fixtures';
import { testProviders } from '../../../../../testing/test-env';
import { GamePage } from './game.page';

describe('GamePage', () => {
  it('loads the game by slug, then its achievements by id', () => {
    TestBed.configureTestingModule({
      providers: testProviders(fakeAuthProvider, {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ slug: 'rogue-harbor' })) },
      }),
    });
    signInAs(null);
    const fixture = TestBed.createComponent(GamePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/games/slug/rogue-harbor').flush(gameDetails());
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne('/api/games/7/achievements').flush({ gameId: 7, total: 1, unlocked: null, achievements: [achievement(1)] });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toBe('Rogue Harbor');
    expect(el.textContent).toContain('Released 14 Mar 2025');
    expect(el.textContent).toContain('Sign in to track');
    expect(el.querySelectorAll('app-achievement-item').length).toBe(1);
    const details = [...el.querySelectorAll('.details dt')].map((d) => d.textContent);
    expect(details).toContain('Developer');
    expect(details).not.toContain('Release date');
  });
});
