import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { testProviders } from '../../../../../testing/test-env';
import { FiltersPage } from './filters.page';

describe('FiltersPage', () => {
  it('keeps changes in a draft until Show results, and Clear all keeps the query', () => {
    TestBed.configureTestingModule({
      providers: testProviders({
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap({ q: 'doom', mode: 'co-op' }) } },
      }),
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(FiltersPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const pc = [...el.querySelectorAll('app-chip button')].find((b) => b.textContent!.includes('PC')) as HTMLButtonElement;
    pc.click();
    fixture.detectChanges();
    expect(navigate).not.toHaveBeenCalled();

    const button = (label: string) => [...el.querySelectorAll('footer button')].find((b) => b.textContent!.includes(label)) as HTMLButtonElement;
    button('Show results').click();
    expect(navigate).toHaveBeenCalledWith(['/search/results'], { queryParams: expect.objectContaining({ q: 'doom', system: 'PC', mode: ['co-op'] }) });

    button('Clear all').click();
    button('Show results').click();
    expect(navigate).toHaveBeenLastCalledWith(['/search/results'], { queryParams: expect.objectContaining({ q: 'doom', system: null, mode: null }) });
  });
});
