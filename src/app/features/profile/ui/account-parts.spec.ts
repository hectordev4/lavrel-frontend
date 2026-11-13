import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../testing/auth-testing';
import { installDialogStandIn } from '../../../../testing/dialog';
import { memberUser, testProviders } from '../../../../testing/test-env';
import { CopyButton } from '../../../shared/ui/copy-button/copy-button';
import { MyAccount } from '../data-access/my-account';
import { AccountEnd } from './account-end/account-end';
import { AccountSection } from './account-section/account-section';

describe('Profile account parts', () => {
  beforeEach(() => {
    installDialogStandIn();
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider, MyAccount) });
    signInAs(memberUser());
  });

  it('AccountSection asks for a name before saving', async () => {
    const f = TestBed.createComponent(AccountSection);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    (el.querySelector('.row') as HTMLButtonElement).click();
    f.detectChanges();
    TestBed.tick();
    const form = [...el.querySelectorAll('form')][0] as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Enter a name.');
    TestBed.inject(HttpTestingController).expectNone('/api/currentuser/username');
  });

  it('AccountEnd only deletes after DELETE is typed', async () => {
    const f = TestBed.createComponent(AccountEnd);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    ([...el.querySelectorAll('button')].find((b) => b.textContent!.includes('Delete account')) as HTMLButtonElement).click();
    f.detectChanges();
    TestBed.tick();
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Type DELETE in capitals to confirm.');
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'DELETE');
  });

  it('CopyButton copies its value and confirms with a tick', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const f = TestBed.createComponent(CopyButton);
    f.componentRef.setInput('value', '4829103755210846');
    f.componentRef.setInput('label', 'Copy your player id');
    f.detectChanges();
    (f.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await f.whenStable();
    f.detectChanges();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('4829103755210846');
    expect(f.nativeElement.querySelector('.tick')).not.toBeNull();
  });
});
