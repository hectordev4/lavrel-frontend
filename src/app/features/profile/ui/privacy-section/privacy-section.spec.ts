import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-env';
import { PrivacySection } from './privacy-section';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('PrivacySection', () => {
  async function render() {
    TestBed.configureTestingModule({ providers: testProviders() });
    const fixture = TestBed.createComponent(PrivacySection);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/currentuser/profile')
      .flush({ public: false, showCountry: false, showPlatforms: false, showAvatar: false });
    await settle();
    fixture.detectChanges();
    return fixture;
  }

  it('keeps the detail switches disabled while the profile is private', async () => {
    const fixture = await render();
    const inputs = [...fixture.nativeElement.querySelectorAll('input')] as HTMLInputElement[];
    expect(inputs.map((i) => i.disabled)).toEqual([false, true, true, true]);
  });

  it('switches back when a change doesn’t save', async () => {
    const fixture = await render();
    (fixture.nativeElement.querySelector('input') as HTMLInputElement).click();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/currentuser/profile');
    expect(req.request.body).toEqual({ public: true });
    req.flush(null, { status: 500, statusText: 'x' });
    await settle();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('didn’t save');
  });
});
