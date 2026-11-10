import { TestBed } from '@angular/core/testing';
import { CtaCard } from './cta-card';

describe('CtaCard', () => {
  it('shows the heading, text and the animated L', () => {
    const fixture = TestBed.createComponent(CtaCard);
    fixture.componentRef.setInput('heading', 'Make it yours');
    fixture.componentRef.setInput('text', 'Sign in to track games.');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')!.textContent).toBe('Make it yours');
    expect(el.querySelector('p')!.textContent).toContain('Sign in');
    expect(el.querySelector('app-cube-logo')!.classList).toContain('mode-intro');
  });
});
