import { TestBed } from '@angular/core/testing';
import { SiteIcon } from './site-icon';

function render(src: string | null, letter = 'D') {
  const fixture = TestBed.createComponent(SiteIcon);
  fixture.componentRef.setInput('src', src);
  fixture.componentRef.setInput('letter', letter);
  fixture.detectChanges();
  return fixture;
}

describe('SiteIcon', () => {
  it('loads the icon from the wiki, decorative and without a referrer', () => {
    const img = (
      render('https://darksouls.fandom.com/favicon.ico').nativeElement as HTMLElement
    ).querySelector('img')!;
    expect(img.getAttribute('src')).toBe('https://darksouls.fandom.com/favicon.ico');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('shows the letter tile when the icon fails, or when there is none', () => {
    const fixture = render('https://x.wiki.gg/favicon.ico', 'X');
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.letter')!.textContent).toBe('X');

    expect(
      (render(null, 'T').nativeElement as HTMLElement).querySelector('.letter')!.textContent,
    ).toBe('T');
  });

  it('tries again when it gets a different icon', () => {
    const fixture = render('https://a.wiki.gg/favicon.ico');
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    fixture.componentRef.setInput('src', 'https://b.wiki.gg/favicon.ico');
    fixture.detectChanges();
    expect(el.querySelector('img')!.getAttribute('src')).toBe('https://b.wiki.gg/favicon.ico');
  });

  it('gives the letter tile its tone', () => {
    const fixture = TestBed.createComponent(SiteIcon);
    fixture.componentRef.setInput('letter', 'D');
    fixture.componentRef.setInput('tone', 6);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.letter')!.getAttribute('data-tone'),
    ).toBe('2');
  });
});
