import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DismissableMenu } from './dismissable-menu';

@Component({
  imports: [DismissableMenu],
  template: `
    <details appMenu>
      <summary>More</summary>
      <div class="menu-panel"><button type="button">Remove</button></div>
    </details>
    <p class="outside">Elsewhere</p>
  `,
})
class Host {}

function open() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
  details.open = true;
  details.dispatchEvent(new Event('toggle'));
  return { fixture, details };
}

describe('DismissableMenu', () => {
  it('closes on a tap outside, but not on a tap inside', () => {
    const { fixture, details } = open();
    fixture.nativeElement.querySelector('.menu-panel button').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(details.open).toBe(true);
    fixture.nativeElement.querySelector('.outside').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(details.open).toBe(false);
  });

  it('closes on Escape', () => {
    const { details } = open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(details.open).toBe(false);
  });

  it('opens towards the right when the panel would leave the screen on the left', () => {
    const { details } = open();
    // jsdom lays nothing out, so the panel reads as starting at x = 0: past the left edge.
    expect(details.classList).toContain('menu-start');
  });
});
