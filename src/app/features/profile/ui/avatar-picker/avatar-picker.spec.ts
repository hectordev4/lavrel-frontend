import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { AvatarPicker } from './avatar-picker';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render() {
  TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
  signInAs(memberUser());
  const fixture = TestBed.createComponent(AvatarPicker);
  fixture.detectChanges();
  TestBed.inject(HttpTestingController).expectOne('/api/avatars/gallery').flush({ galleryIds: ['gallery-01', 'gallery-02'] });
  await settle();
  fixture.detectChanges();
  return fixture;
}

const button = (el: HTMLElement, text: string) =>
  [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === text) as HTMLButtonElement;

describe('AvatarPicker', () => {
  it('saves a gallery picture once one is chosen', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Gallery').click();
    fixture.detectChanges();
    expect(button(el, 'Save avatar').disabled).toBe(true);
    (el.querySelector('[aria-label="Gallery picture 02"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    button(el, 'Save avatar').click();
    await settle();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/currentuser/profile/avatar/gallery');
    expect(req.request.body).toEqual({ galleryId: 'gallery-02' });
  });

  it('refuses files that aren’t JPG, PNG or GIF', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Upload').click();
    fixture.detectChanges();
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [new File(['x'], 'x.bmp', { type: 'image/bmp' })] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Choose a JPG, PNG or GIF.');
    expect(button(el, 'Save avatar').disabled).toBe(true);
  });

  it('credits Pixelbot', async () => {
    const fixture = await render();
    expect(fixture.nativeElement.textContent).toContain('Pixelbot by DiceBear, CC0 1.0');
  });
});
