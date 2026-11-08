import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../testing/auth-testing';
import { memberUser, testProviders } from '../../../testing/test-env';
import { MyAvatar } from './my-avatar';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('MyAvatar', () => {
  let me: MyAvatar;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    me = TestBed.inject(MyAvatar);
    http = TestBed.inject(HttpTestingController);
    const loading = me.ensureLoaded();
    http.expectOne('/api/currentuser').flush({ username: 'swiftOtter', publicId: '4829103755210846' });
    http.expectOne('/api/currentuser/profile/avatar').flush({ kind: 'GENERATED', galleryId: null, url: null });
    await loading;
  });

  it('uses the public id as the seed and the name’s initial', () => {
    expect(me.seed()).toBe('4829103755210846');
    expect(me.initial()).toBe('S');
  });

  it('explains a refused upload', async () => {
    const done = me.upload(new File(['x'], 'x.bmp', { type: 'image/bmp' }));
    await settle();
    http
      .expectOne('/api/currentuser/profile/avatar')
      .flush({ error: 'invalid_avatar', message: 'Use a JPG, PNG or GIF.' }, { status: 400, statusText: 'x' });
    expect(await done).toBe('Use a JPG, PNG or GIF.');
  });

  it('forgets everything on sign-out', () => {
    signInAs(null);
    expect(me.loaded()).toBe(false);
    expect(me.avatar()).toBeNull();
  });
});
