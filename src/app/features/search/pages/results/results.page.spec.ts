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
        useValue: {
          queryParamMap: of(convertToParamMap({ q: 'rogue', tag: '1716:Roguelike', system: 'PC' })),
          snapshot: {
            queryParamMap: convertToParamMap({ q: 'rogue', tag: '1716:Roguelike', system: 'PC' }),
          },
        },
      }),
    });
    signInAs(null);
    const fixture = TestBed.createComponent(ResultsPage);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url === '/api/games')
      .flush({
        games: [{ id: 7, title: 'Rogue Harbor', slug: 'rogue-harbor', topTags: [], modes: null }],
        page: 0,
        size: 20,
        hasMore: false,
      });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect([...el.querySelectorAll('h1')].map((h) => h.textContent).join(' ')).toContain(
      'Results for “rogue”',
    );
    const chips = [...el.querySelectorAll('app-chip button')]
      .filter((b) => !b.closest('app-filters-page'))
      .map((b) => b.getAttribute('aria-label'))
      .filter((label) => label?.startsWith('Remove'));
    expect(chips).toEqual(['Remove Roguelike', 'Remove PC']);
    expect(el.querySelectorAll('app-result-card').length).toBe(1);
  });
});

describe('ResultsPage on desktop', () => {
  it('keeps the filters open as a side panel, following the address', () => {
    TestBed.configureTestingModule({
      providers: testProviders(fakeAuthProvider, {
        provide: ActivatedRoute,
        useValue: {
          queryParamMap: of(convertToParamMap({ q: 'rogue', mode: 'co-op' })),
          snapshot: { queryParamMap: convertToParamMap({ q: 'rogue', mode: 'co-op' }) },
        },
      }),
    });
    signInAs(null);
    const fixture = TestBed.createComponent(ResultsPage);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('app-filters-page.panel') as HTMLElement;
    expect(panel.classList).toContain('embedded');
    const coop = [...panel.querySelectorAll('app-chip button')].find((b) =>
      b.textContent!.includes('Co-op'),
    )!;
    expect(coop.getAttribute('aria-pressed')).toBe('true');
  });
});
