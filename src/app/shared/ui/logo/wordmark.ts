import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CubeLogo, CubeLogoMode } from './cube-logo';

/** The brand lockup: the cube L leading "avrel", read as Lavrel. */
@Component({
  selector: 'app-wordmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  template: `
    <app-cube-logo [mode]="mode()" label="" />
    <span class="letters" [class.reveal]="mode() === 'intro'">
      @for (letter of letters; track $index) {
        <span [style.--i]="$index">{{ letter }}</span>
      }
    </span>
    <span class="visually-hidden">Lavrel</span>
  `,
  styles: `
    :host {
      --mark: 7rem;
      display: inline-flex;
      align-items: flex-end;
      gap: calc(var(--mark) * 0.04);
    }

    app-cube-logo {
      height: var(--mark);
      width: calc(var(--mark) * 0.535);
      --cube-stroke: 3;
    }

    .letters {
      display: flex;
      font-family: var(--font-mark);
      font-weight: 500;
      font-size: calc(var(--mark) * 0.3);
      line-height: 0.74;
      letter-spacing: 0.06em;
      color: var(--line);
      padding-bottom: calc(var(--mark) * 0.035);
    }

    .reveal span {
      animation: letter 480ms ease-out both;
      animation-delay: calc(900ms + var(--i) * 70ms);
    }

    @keyframes letter {
      from {
        opacity: 0;
        transform: translateX(-6px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal span {
        animation-name: fade;
      }
      @keyframes fade {
        from { opacity: 0; }
      }
    }
  `,
})
export class Wordmark {
  readonly mode = input<CubeLogoMode>('still');
  protected readonly letters = ['A', 'V', 'R', 'E', 'L'];
}
