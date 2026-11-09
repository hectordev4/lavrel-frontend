import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { trackedGame } from '../../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { AssistantPage } from './assistant.page';

describe('AssistantPage', () => {
  it('offers your pinned and playing games to chat about', async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(AssistantPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser/tracked')
      .flush({ games: [trackedGame(1, { pinPosition: 1 }), trackedGame(2), trackedGame(3, { status: 'BACKLOG' })] });
    await fixture.whenStable();
    fixture.detectChanges();
    const links = [...fixture.nativeElement.querySelectorAll('.games a')].map((a: Element) => a.getAttribute('href'));
    expect(links).toEqual(['/assistant/chat/1?game=Game%201&slug=game-1', '/assistant/chat/2?game=Game%202&slug=game-2']);
    expect(fixture.nativeElement.textContent).toContain('tap Guide');
  });
});
