import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/** Space kept between a menu and the screen's edges. */
const EDGE = 8;

/**
 * For a <details> menu: closes on a tap anywhere outside it or on Escape, and opens its panel (`.menu-panel`)
 * towards whichever side has room, so a menu on a card at the left edge opens to the right instead of off-screen.
 * Adds `menu-start` (panel anchored to the menu's left) or nothing (anchored to its right) to the <details>.
 */
@Directive({
  selector: 'details[appMenu]',
  host: { '(toggle)': 'onToggle()' },
})
export class DismissableMenu {
  private readonly details = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  private readonly outside = (event: Event) => {
    if (!this.details.contains(event.target as Node)) this.close();
  };
  private readonly escape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
      this.details.querySelector('summary')?.focus();
    }
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopListening());
  }

  protected onToggle(): void {
    if (this.details.open) {
      this.document.addEventListener('pointerdown', this.outside, true);
      this.document.addEventListener('keydown', this.escape);
      this.place();
    } else {
      this.stopListening();
    }
  }

  close(): void {
    this.details.open = false;
    this.stopListening();
  }

  /** Anchors the panel to the right by default; flips it to the left anchor if it would leave the screen. */
  private place(): void {
    this.details.classList.remove('menu-start');
    const panel = this.details.querySelector<HTMLElement>('.menu-panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (rect.left < EDGE) this.details.classList.add('menu-start');
  }

  private stopListening(): void {
    this.document.removeEventListener('pointerdown', this.outside, true);
    this.document.removeEventListener('keydown', this.escape);
  }
}
