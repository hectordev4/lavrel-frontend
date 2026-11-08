import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { trackedGame } from '../../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { GamesPage } from './games.page';

describe('GamesPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
  });

  async function render(games: ReturnType<typeof trackedGame>[]) {
    const fixture = TestBed.createComponent(GamesPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/currentuser/tracked').flush({ games });
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('invites to find a game when nothing is tracked', async () => {
    const el = await render([]);
    expect(el.textContent).toContain('Nothing tracked yet');
  });

  it('shows counts per status and one card per game', async () => {
    const el = await render([trackedGame(1, { pinPosition: 1 }), trackedGame(2, { status: 'BACKLOG' })]);
    expect(el.textContent).toContain('2 tracked · 1 of 20 pinned to Home');
    const chips = [...el.querySelectorAll('app-chip button')].map((b) => b.textContent!.replace(/\s+/g, ' ').trim());
    expect(chips).toEqual(['All 2', 'Playing 1', 'Backlog 1', 'Completed 0', 'Dropped 0']);
    expect(el.querySelectorAll('app-tracked-card').length).toBe(2);
  });
});
