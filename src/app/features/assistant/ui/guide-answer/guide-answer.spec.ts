import { TestBed } from '@angular/core/testing';
import { GuideAnswer } from './guide-answer';

function render(grounded: boolean, sources: object[] = []) {
  const fixture = TestBed.createComponent(GuideAnswer);
  fixture.componentRef.setInput('html', '<p>Go <strong>left</strong></p>');
  fixture.componentRef.setInput('grounded', grounded);
  fixture.componentRef.setInput('sources', sources);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('GuideAnswer', () => {
  it('marks a curated guide as Reviewed', () => {
    const fixture = TestBed.createComponent(GuideAnswer);
    fixture.componentRef.setInput('html', '<p>x</p>');
    fixture.componentRef.setInput('curated', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.reviewed').textContent).toContain('Reviewed');
  });

  it('flags an answer that isn’t grounded', () => {
    expect(render(false).querySelector('.unchecked')!.textContent).toContain('may be inaccurate');
  });

  describe('sources', () => {
    const page = (n: number, extra: object = {}) => ({
      title: `Page ${n}`,
      url: `https://darksouls.fandom.com/wiki/${n}`,
      site: 'Dark Souls Wiki',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      ...extra,
    });
    const fextra = page(3, {
      url: 'https://darksouls3.wiki.fextralife.com/Lothric',
      site: 'Fextralife',
      title: 'Lothric Castle',
    });

    function open(el: HTMLElement, fixture?: { detectChanges(): void }) {
      (el.querySelector('.toggle') as HTMLButtonElement).click();
      fixture?.detectChanges();
    }

    function renderFixture(sources: object[]) {
      const fixture = TestBed.createComponent(GuideAnswer);
      fixture.componentRef.setInput('html', '<p>x</p>');
      fixture.componentRef.setInput('grounded', true);
      fixture.componentRef.setInput('sources', sources);
      fixture.detectChanges();
      return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    it('starts closed: one button with each wiki’s icon once and the count, last in the answer', () => {
      const { el } = renderFixture([page(1), page(2), fextra]);
      const toggle = el.querySelector('.toggle')!;
      expect(toggle.textContent!.trim()).toBe('3 sources');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(
        [...toggle.querySelectorAll('app-site-icon img')].map((i) => i.getAttribute('src')),
      ).toEqual([
        'https://darksouls.fandom.com/favicon.ico',
        'https://darksouls3.wiki.fextralife.com/favicon.ico',
      ]);
      expect(el.querySelector('.list')).toBeNull();
      expect(el.querySelector('.answer')!.lastElementChild!.classList).toContain('sources');
    });

    it('says "1 source" for one, and shows nothing without sources', () => {
      expect(
        renderFixture([page(1)])
          .el.querySelector('.toggle')!
          .textContent!.trim(),
      ).toBe('1 source');
      expect(render(false).querySelector('.sources')).toBeNull();
    });

    it('opens the list: icon, wiki and page per row, then the linked license', () => {
      const { fixture, el } = renderFixture([page(1), fextra]);
      open(el, fixture);
      const toggle = el.querySelector('.toggle')!;
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.getAttribute('aria-controls')).toBe(el.querySelector('.list')!.id);

      const rows = [...el.querySelectorAll('.row')];
      expect(
        rows.map((r) => [
          r.querySelector('.site')!.textContent,
          r.querySelector('.title')!.textContent,
        ]),
      ).toEqual([
        ['Dark Souls Wiki', 'Page 1'],
        ['Fextralife', 'Lothric Castle'],
      ]);
      expect(rows[0].getAttribute('href')).toBe('https://darksouls.fandom.com/wiki/1');
      expect(rows[0].getAttribute('target')).toBe('_blank');

      const license = el.querySelector('.license a')!;
      expect(license.textContent).toBe('CC BY-SA 3.0');
      expect(license.getAttribute('href')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
      expect(el.querySelector('.license')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Text under CC BY-SA 3.0',
      );

      open(el, fixture);
      expect(el.querySelector('.list')).toBeNull();
    });

    it('falls back to the host, a plain license and the favicon when the backend sends no site or links', () => {
      const { fixture, el } = renderFixture([page(1, { site: null, licenseUrl: null })]);
      open(el, fixture);
      expect(el.querySelector('.row .site')!.textContent).toBe('darksouls.fandom.com');
      expect(el.querySelector('.license a')).toBeNull();
      expect(el.querySelector('.license')!.textContent).toContain('CC BY-SA 3.0');
    });

    it('uses an icon the backend sends, keeps only web links, and lists each license once', () => {
      const { fixture, el } = renderFixture([
        page(1, { iconUrl: 'https://static.wikia.nocookie.net/ds/favicon.png', licenseUrl: null }),
        page(2),
        page(4, {
          site: 'B Wiki',
          url: 'https://b.wiki.gg/4',
          license: 'CC BY-SA 4.0',
          licenseUrl: 'javascript:alert(1)',
          iconUrl: 'javascript:x',
        }),
      ]);
      open(el, fixture);
      const icons = [...el.querySelectorAll('.row app-site-icon img')].map((i) =>
        i.getAttribute('src'),
      );
      expect(icons).toEqual([
        'https://static.wikia.nocookie.net/ds/favicon.png',
        'https://darksouls.fandom.com/favicon.ico',
        'https://b.wiki.gg/favicon.ico',
      ]);
      expect([...el.querySelectorAll('.license .name')].map((n) => n.textContent!.trim())).toEqual([
        'CC BY-SA 3.0',
        'CC BY-SA 4.0',
      ]);
      expect([...el.querySelectorAll('.license a')].map((a) => a.textContent)).toEqual([
        'CC BY-SA 3.0',
      ]);
    });

    it('shows the wiki’s initial when a source has no web address for an icon', () => {
      const { fixture, el } = renderFixture([page(1, { url: 'not a url', site: 'éter wiki' })]);
      open(el, fixture);
      expect(el.querySelector('.row .letter')!.textContent).toBe('É');
    });
  });
});
