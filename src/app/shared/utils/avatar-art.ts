/**
 * Draws Pixelbot avatars (DiceBear, CC0 1.0) with their built-in animation, as image addresses.
 * The same seed always gives the same robot. DiceBear is loaded on first use, so it stays out of the
 * first download; the animation stops by itself for people who ask for reduced motion.
 */
type Draw = (seed: string) => string;

let drawing: Promise<Draw> | null = null;
const cache = new Map<string, string>();

function load(): Promise<Draw> {
  drawing ??= Promise.all([
    import('@dicebear/core'),
    import('@dicebear/styles/pixelbot.json', { with: { type: 'json' } }),
  ]).then(([{ Avatar, Style }, definition]) => {
    const style = new Style((definition as { default?: unknown }).default ?? definition);
    return (seed: string) => new Avatar(style, { seed, animationVariant: 'slow' }).toString();
  });
  return drawing;
}

/** A data: address of the animated Pixelbot for this seed, ready for an <img>. */
export async function pixelbotUrl(seed: string): Promise<string> {
  const known = cache.get(seed);
  if (known) return known;
  const svg = (await load())(seed);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(seed, url);
  return url;
}
