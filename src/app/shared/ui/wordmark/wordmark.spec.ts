import { TestBed } from '@angular/core/testing';
import { Wordmark } from './wordmark';

describe('Wordmark', () => {
  it('reads as Lavrel for screen readers', () => {
    const fixture = TestBed.createComponent(Wordmark);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.visually-hidden').textContent).toBe('Lavrel');
  });
});
