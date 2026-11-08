import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../../../testing/test-env';
import { MyAvatar } from '../../../../core/profile/my-avatar';
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

describe('AvatarPicker uploads', () => {
  it('stops files over the backend’s size limit before uploading', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Upload').click();
    fixture.detectChanges();
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    const bigGif = new File([new Uint8Array(1024 * 1024 + 1)], 'big.gif', { type: 'image/gif' });
    Object.defineProperty(input, 'files', { value: [bigGif] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(el.textContent).toContain('GIFs can be up to 1 MB.');
  });

  it('sends a valid picture as the body and shows the stored imageUrl', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    button(el, 'Upload').click();
    fixture.detectChanges();
    const input = el.querySelector('input[type="file"]') as HTMLInputElement;
    const png = new File(['png'], 'me.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [png] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    button(el, 'Save avatar').click();
    await settle();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/currentuser/profile/avatar');
    expect(req.request.body).toBe(png);
    req.flush({ kind: 'UPLOADED', galleryId: null, imageUrl: 'https://x.supabase.co/storage/v1/object/public/avatars/a.png' });
    await settle();
    expect(TestBed.inject(MyAvatar).avatar()?.imageUrl).toContain('/avatars/a.png');
  });
});
