import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { fakeAuthProvider, signInAs } from '../../../../../testing/auth-testing';
import { testProviders } from '../../../../../testing/test-env';
import { ResultsPage } from './results.page';

describe('ResultsPage', () => {
  it('shows a removable chip per filter and the results', () => {
    TestBed.configureTestingModule({
      providers: testProviders(fakeAuthProvider, {
        provide: ActivatedRoute,
        useValue: { queryParamMap: of(convertToParamMap({ q: 'rogue', tag: '1716:Roguelike', system: 'PC' })) },
      }),
    });
    signInAs(null);
    const fixture = TestBed.createComponent(ResultsPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url === '/api/games')
      .flush({ games: [{ id: 7, title: 'Rogue Harbor', slug: 'rogue-harbor', topTags: [], modes: null }], page: 0, size: 20, hasMore: false });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toContain('Results for “rogue”');
    const chips = [...el.querySelectorAll('app-chip button')].map((b) => b.getAttribute('aria-label'));
    expect(chips).toEqual(['Remove Roguelike', 'Remove PC']);
    expect(el.querySelectorAll('app-result-card').length).toBe(1);
  });
});
