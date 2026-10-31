/**
 * How the cubes move.
 * - still:   drawn, no motion.
 * - intro:   cubes drop in one by one, each top face flashes like an unlock, then the idle shake.
 * - idle:    every few seconds a shake runs through the cubes one by one, from the top of the L to its foot.
 * - loading: a light chases through the cubes in a loop.
 * - boot:    intro build, then the loading chase (the splash screen).
 */
export type CubeLogoMode = 'still' | 'intro' | 'idle' | 'loading' | 'boot';
