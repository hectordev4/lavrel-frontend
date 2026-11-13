import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { gameDetails } from '../../../../../testing/fixtures';
import { testProviders } from '../../../../../testing/test-env';
import { GamePage } from './game.page';

describe('GamePage', () => {
  it('loads the game by slug and lays out its parts, with the achievements loading as they scroll in', () => {
    TestBed.configureTestingModule({
      providers: testProviders(fakeAuthProvider, {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ slug: 'rogue-harbor' })) },
      }),
    });
    signInAs(null);
    const fixture = TestBed.createComponent(GamePage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/games/slug/rogue-harbor')
      .flush(gameDetails());
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toBe('Rogue Harbor');
    expect(el.textContent).toContain('Released 14 Mar 2025');
    expect(el.textContent).toContain('Sign in to track');
    expect(el.querySelector('app-game-about')).not.toBeNull();
    expect(el.querySelector('app-game-labels')).not.toBeNull();
    expect(el.querySelector('.lazy')).not.toBeNull();
    const details = [...el.querySelectorAll('.details dt')].map((d) => d.textContent);
    expect(details).toContain('Developer');
    expect(details).not.toContain('Release date');
  });
});
