import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { testProviders } from '../../../../../testing/test-env';
import { SearchPage } from './search.page';

describe('SearchPage', () => {
  it('opens the full results on Enter', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SearchPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    input.value = 'witcher';
    input.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(navigate).toHaveBeenCalledWith(['/search/results'], { queryParams: { q: 'witcher' } });
  });
});
