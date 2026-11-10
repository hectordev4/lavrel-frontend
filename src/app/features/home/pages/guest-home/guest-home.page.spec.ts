import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-env';
import { GuestHomePage } from './guest-home.page';

describe('GuestHomePage', () => {
  it('shows the sign-in card and the popular games', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    const fixture = TestBed.createComponent(GuestHomePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.params.get('sort') === 'popular')
      .flush({ games: [{ id: 1, title: 'Popular One', slug: 'popular-one', topTags: [], modes: null }], page: 0, size: 5, hasMore: false });
    http.expectOne((r) => r.params.get('sort') === 'newest').flush({ games: [], page: 0, size: 8, hasMore: false });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Make it yours');
    expect(el.textContent).toContain('Popular One');
  });
});
