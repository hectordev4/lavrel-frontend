import { TestBed } from '@angular/core/testing';
import { PerfectDiamond } from './perfect-diamond';

describe('PerfectDiamond', () => {
  it('has an accessible name by default', () => {
    const fixture = TestBed.createComponent(PerfectDiamond);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Completed 100%');
  });

  it('hides itself when the text next to it says it', () => {
    const fixture = TestBed.createComponent(PerfectDiamond);
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });
});
