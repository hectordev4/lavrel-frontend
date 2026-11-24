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
  it('shows sources last, as pills with the site and license', () => {
    const el = render(true, [{ title: 'Night Owl Run', url: 'https://www.hades.fandom.com/wiki/X', license: 'CC BY-SA 3.0' }]);
    expect(el.querySelector('.unchecked')).toBeNull();
    const pill = el.querySelector('.pill')!;
    expect(pill.textContent!.trim()).toBe('hades.fandom.com');
    expect(pill.getAttribute('aria-label')).toContain('CC BY-SA 3.0');
    expect(el.querySelector('.answer')!.lastElementChild!.classList).toContain('license');
  });

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

  describe('sources from backend 0.17.0', () => {
    const terraria = {
      title: 'Guide',
      url: 'https://terraria.wiki.gg/wiki/Guide',
      site: 'Terraria Wiki',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    };

    it('names the pill after the wiki, and links the license', () => {
      const el = render(true, [terraria]);
      const pill = el.querySelector('.pill')!;
      expect(pill.textContent!.trim()).toBe('Terraria Wiki');
      expect(pill.getAttribute('href')).toBe('https://terraria.wiki.gg/wiki/Guide');
      expect(pill.getAttribute('aria-label')).toBe('Guide, Terraria Wiki, CC BY-SA 3.0');
      const license = el.querySelector('.license a')!;
      expect(license.textContent).toBe('CC BY-SA 3.0');
      expect(license.getAttribute('href')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
      expect(license.getAttribute('target')).toBe('_blank');
      expect(el.querySelector('.license')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Sources: CC BY-SA 3.0');
    });

    it('falls back to the host and plain license text when site and licenseUrl are null', () => {
      const el = render(true, [{ ...terraria, site: null, licenseUrl: null }]);
      expect(el.querySelector('.pill')!.textContent!.trim()).toBe('terraria.wiki.gg');
      expect(el.querySelector('.license a')).toBeNull();
      expect(el.querySelector('.license')!.textContent).toContain('CC BY-SA 3.0');
    });

    it('lists each license once, linked if any of its sources has a link, and keeps only web links', () => {
      const el = render(true, [
        { ...terraria, url: 'https://a.wiki.gg/1', licenseUrl: null },
        { ...terraria, url: 'https://a.wiki.gg/2' },
        { ...terraria, url: 'https://b.fandom.com/3', site: 'B Wiki', license: 'CC BY-SA 4.0', licenseUrl: 'javascript:alert(1)' },
      ]);
      expect([...el.querySelectorAll('.pill')].map((p) => p.textContent!.trim())).toEqual(['Terraria Wiki', 'Terraria Wiki', 'B Wiki']);
      expect(el.querySelector('.license')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Sources: CC BY-SA 3.0, CC BY-SA 4.0');
      const links = [...el.querySelectorAll('.license a')];
      expect(links.map((a) => a.textContent)).toEqual(['CC BY-SA 3.0']);
    });
  });
});

