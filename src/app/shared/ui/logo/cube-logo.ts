import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * How the cubes move.
 * - still:   drawn, no motion.
 * - intro:   cubes drop in one by one, each top face flashes like an unlock, then the idle shake.
 * - idle:    every few seconds a shake runs through the cubes one by one, from the top of the L to its foot.
 * - loading: a light chases through the cubes in a loop.
 * - boot:    intro build, then the loading chase (the splash screen).
 */
export type CubeLogoMode = 'still' | 'intro' | 'idle' | 'loading' | 'boot';

/** Origins of the 8 cubes of the L, in build order: the stem top to bottom, then the foot. */
const CUBES: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0, 36], [0, 72], [0, 108], [0, 144],
  [28, 160.5], [56, 177], [84, 193.5],
];

@Component({
  selector: 'app-cube-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cube-logo.html',
  styleUrl: './cube-logo.scss',
  host: { '[class]': '"mode-" + mode()' },
})
export class CubeLogo {
  readonly mode = input<CubeLogoMode>('still');
  /** Accessible name; pass an empty string when a visible wordmark already says "Lavrel". */
  readonly label = input('Lavrel');

  protected readonly cubes = CUBES;
}
