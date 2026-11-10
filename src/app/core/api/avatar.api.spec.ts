import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-env';
import { AvatarApi } from './avatar.api';

describe('AvatarApi', () => {
  let api: AvatarApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders() });
    api = TestBed.inject(AvatarApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads the file itself as the body, with its type', () => {
    const file = new File(['gif'], 'me.gif', { type: 'image/gif' });
    api.upload(file).subscribe();
    const req = http.expectOne('/api/currentuser/profile/avatar');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(file);
    expect(req.request.headers.get('Content-Type')).toBe('image/gif');
    req.flush({ kind: 'UPLOADED', galleryId: null, imageUrl: 'https://cdn/me.gif' });
  });

  it('picks a gallery picture and lists the gallery', () => {
    api.chooseGallery('gallery-07').subscribe();
    expect(http.expectOne('/api/currentuser/profile/avatar/gallery').request.body).toEqual({ galleryId: 'gallery-07' });
    let ids: string[] = [];
    api.galleryIds().subscribe((g) => (ids = g));
    http.expectOne('/api/avatars/gallery').flush({ galleryIds: ['gallery-01', 'gallery-02'] });
    expect(ids).toEqual(['gallery-01', 'gallery-02']);
  });
});
