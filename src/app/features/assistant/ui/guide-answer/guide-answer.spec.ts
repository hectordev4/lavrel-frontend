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

  it('flags an answer that isn’t grounded', () => {
    expect(render(false).querySelector('.unchecked')!.textContent).toContain('may be inaccurate');
  });
});
