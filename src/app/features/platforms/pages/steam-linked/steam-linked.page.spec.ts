import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { SteamLinkedPage } from './steam-linked.page';

describe('SteamLinkedPage', () => {
  it('explains a failed link and offers Try again', () => {
    TestBed.configureTestingModule({
      providers: testProviders(fakeAuthProvider, {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap({ status: 'error', reason: 'account_already_linked' }) } },
      }),
    });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(SteamLinkedPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Steam isn’t linked yet');
    expect(el.textContent).toContain('already linked to another Lavrel account');
    expect(el.textContent).toContain('Try again');
  });
});
