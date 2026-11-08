import { pixelbotUrl } from './avatar-art';

describe('pixelbotUrl', () => {
  it('draws an animated SVG that respects reduced motion', async () => {
    const url = await pixelbotUrl('4829103755210846');
    expect(url.startsWith('data:image/svg+xml')).toBe(true);
    const svg = decodeURIComponent(url.split(',')[1]);
    expect(svg).toContain('@keyframes');
    expect(svg).toContain('prefers-reduced-motion');
  });

  it('gives the same robot for the same seed, and another for another seed', async () => {
    expect(await pixelbotUrl('gallery-01')).toBe(await pixelbotUrl('gallery-01'));
    expect(await pixelbotUrl('gallery-01')).not.toBe(await pixelbotUrl('gallery-02'));
  });
});
