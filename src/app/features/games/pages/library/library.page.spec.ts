import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { libraryGame } from '../../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { LibraryPage } from './library.page';
import { installDialogStandIn } from '../../../../../testing/dialog';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('LibraryPage', () => {
  it('lists owned games with the collection chips', async () => {
    installDialogStandIn();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const fixture = TestBed.createComponent(LibraryPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/currentuser/accounts').flush({ accounts: [{ platform: 'STEAM', externalId: '1', displayName: null, lastSyncedAt: null }] });
    http.expectOne((r) => r.url === '/api/currentuser/games').flush({ games: [libraryGame(1), libraryGame(2)], page: 0, size: 48, hasMore: false });
    http.expectOne('/api/currentuser/collections').flush({ collections: [{ id: 'c1', name: 'Cozy', position: 1, gameCount: 3 }] });
    await settle();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-library-card').length).toBe(2);
    const chips = [...el.querySelectorAll('.collections app-chip button')].map((b) => b.textContent!.replace(/\s+/g, ' ').trim());
    expect(chips).toEqual(['All games', 'Cozy 3']);
  });
});
