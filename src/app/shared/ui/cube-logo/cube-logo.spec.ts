import { TestBed } from '@angular/core/testing';
import { CubeLogo } from './cube-logo';

describe('CubeLogo', () => {
  it('draws the 8 cubes of the L and reflects the mode as a class', () => {
    const fixture = TestBed.createComponent(CubeLogo);
    fixture.componentRef.setInput('mode', 'loading');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.cube').length).toBe(8);
    expect(host.classList).toContain('mode-loading');
  });

  it('is hidden from screen readers when the label is empty', () => {
    const fixture = TestBed.createComponent(CubeLogo);
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });
});
