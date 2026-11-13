import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { testProviders } from '../../../../../testing/test-env';
import { PlayerPage } from './player.page';

function render() {
  TestBed.configureTestingModule({
    providers: testProviders({ provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ publicId: '4829103755210846' })) } }),
  });
  const fixture = TestBed.createComponent(PlayerPage);
  fixture.detectChanges();
  return { fixture, req: TestBed.inject(HttpTestingController).expectOne('/api/users/4829103755210846') };
}

describe('PlayerPage', () => {
  it('shows the header, only what the owner shares, and the shelves', () => {
    const { fixture, req } = render();
    req.flush({
      profile: { publicId: '4829103755210846', username: 'SwiftOtter', memberSince: '2026-10', country: null, platforms: ['STEAM'] },
      shelves: [{ id: 's1', type: 'PLAYING', title: null, collectionName: null, games: [], achievements: null, stats: null }],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toBe('SwiftOtter');
    expect(el.textContent).toContain('ID 4829 1037 5521 0846');
    expect(el.textContent).toContain('Member since October 2026');
    expect(el.querySelector('.country')).toBeNull();
    expect(el.querySelector('.badge')!.getAttribute('aria-label')).toBe('Steam');
    expect(el.querySelectorAll('app-shelf').length).toBe(1);
  });

  it('treats a private profile like an unknown one', () => {
    const { fixture, req } = render();
    req.flush({ error: 'profile_not_found' }, { status: 404, statusText: 'x' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Profile not found');
  });
});

describe('PlayerPage switching profiles', () => {
  it('cancels the old request when the id changes, so a late answer never wins', () => {
    const ids = new BehaviorSubject(convertToParamMap({ publicId: '1' }));
    TestBed.configureTestingModule({ providers: testProviders({ provide: ActivatedRoute, useValue: { paramMap: ids } }) });
    const fixture = TestBed.createComponent(PlayerPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const first = http.expectOne('/api/users/1');
    ids.next(convertToParamMap({ publicId: '2' }));
    const second = http.expectOne('/api/users/2');
    expect(first.cancelled).toBe(true);
    second.flush({ profile: { publicId: '2', username: 'Second', memberSince: null, country: null, platforms: null }, shelves: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Second');
  });
});
