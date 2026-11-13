import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { achievement } from '../../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { GameAchievementsSection } from './game-achievements.section';

describe('GameAchievementsSection', () => {
  function render() {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(GameAchievementsSection);
    fixture.componentRef.setInput('game', { id: 7, title: 'Rogue Harbor', slug: 'rogue-harbor' });
    fixture.detectChanges();
    TestBed.tick();
    return { fixture, http: TestBed.inject(HttpTestingController) };
  }

  it('loads the achievements by game id, with your progress', () => {
    const { fixture, http } = render();
    http
      .expectOne('/api/games/7/achievements')
      .flush({
        gameId: 7,
        total: 2,
        unlocked: 1,
        achievements: [achievement(1, { unlocked: true }), achievement(2)],
      });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-progress-card')).not.toBeNull();
    expect(el.querySelectorAll('app-achievement-item').length).toBe(2);
    expect(el.querySelector('.guide')).not.toBeNull();
  });

  it('shows its own error with Try again', () => {
    const { fixture, http } = render();
    http.expectOne('/api/games/7/achievements').flush(null, { status: 500, statusText: 'x' });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.btn-secondary') as HTMLButtonElement).click();
    http.expectOne('/api/games/7/achievements');
  });
});
