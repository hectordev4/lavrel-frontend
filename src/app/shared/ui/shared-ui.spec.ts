import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConnectSteamCard } from './connect-steam-card/connect-steam-card';
import { PageHeader } from './page-header/page-header';
import { SearchBox } from './search-box/search-box';
import { Segmented } from './segmented/segmented';
import { SelectField } from './select-field/select-field';

describe('shared form and layout pieces', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('SearchBox is labelled and emits what is typed', () => {
    const f = TestBed.createComponent(SearchBox);
    f.componentRef.setInput('label', 'Find a game');
    f.detectChanges();
    const spy = vi.fn();
    f.componentInstance.typed.subscribe(spy);
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hades';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('hades');
    expect(f.nativeElement.querySelector('.visually-hidden').textContent).toBe('Find a game');
  });

  it('Segmented presses the current value and emits the chosen one', () => {
    const f = TestBed.createComponent(Segmented);
    f.componentRef.setInput('options', [
      { value: 'recent', label: 'Recent' },
      { value: 'name', label: 'Name' },
    ]);
    f.componentRef.setInput('value', 'recent');
    f.componentRef.setInput('label', 'Order');
    f.detectChanges();
    const [recent, name] = f.nativeElement.querySelectorAll('button');
    expect(recent.getAttribute('aria-pressed')).toBe('true');
    const spy = vi.fn();
    f.componentInstance.changed.subscribe(spy);
    name.click();
    expect(spy).toHaveBeenCalledWith('name');
  });

  it('SelectField emits the chosen value', () => {
    const f = TestBed.createComponent(SelectField);
    f.componentRef.setInput('options', [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]);
    f.componentRef.setInput('value', 'a');
    f.componentRef.setInput('label', 'Sort by');
    f.detectChanges();
    const spy = vi.fn();
    f.componentInstance.changed.subscribe(spy);
    const select = f.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'b';
    select.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('PageHeader shows the title with a labelled back link', () => {
    const f = TestBed.createComponent(PageHeader);
    f.componentRef.setInput('heading', 'Find players');
    f.componentRef.setInput('backLink', '/search');
    f.componentRef.setInput('backLabel', 'Back to search');
    f.detectChanges();
    const back = f.nativeElement.querySelector('a');
    expect(back.getAttribute('href')).toBe('/search');
    expect(back.getAttribute('aria-label')).toBe('Back to search');
    expect(f.nativeElement.querySelector('h1').textContent).toBe('Find players');
  });

  it('ConnectSteamCard is disabled while busy', () => {
    const f = TestBed.createComponent(ConnectSteamCard);
    f.componentRef.setInput('busy', true);
    f.detectChanges();
    expect((f.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
