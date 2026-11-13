import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * A small square copy button. After copying, a green tick shows for one second on its own layer (nothing moves),
 * and screen readers hear the confirmation. If the clipboard is blocked, nothing happens: the text stays visible.
 */
@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="copy">
      <button type="button" class="copy-btn" [attr.aria-label]="label()" (click)="copy()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      </button>
      @if (copied()) {
        <svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
      }
    </span>
    <span class="visually-hidden" role="status">{{ copied() ? confirmation() : '' }}</span>
  `,
  styleUrl: './copy-button.scss',
})
export class CopyButton {
  /** The text to copy. */
  readonly value = input.required<string>();
  readonly label = input('Copy');
  readonly confirmation = input('Copied');
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1000);
    } catch {
      // Clipboard blocked: the text is still on screen to copy by hand.
    }
  }
}
