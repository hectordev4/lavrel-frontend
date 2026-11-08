import { progressPercent, progressTier } from './progress-tier';

describe('progressTier', () => {
  it.each([
    [0, 'gray'],
    [19, 'gray'],
    [20, 'bronze'],
    [49, 'bronze'],
    [50, 'silver'],
    [79, 'silver'],
    [80, 'gold'],
    [89, 'gold'],
    [90, 'gold-aura'],
    [99, 'gold-aura'],
    [100, 'perfect'],
  ] as const)('puts %i%% in the %s tier', (percent, tier) => {
    expect(progressTier(percent)).toBe(tier);
  });
});

describe('progressPercent', () => {
  it('rounds down, so it only reaches 100 when everything is unlocked', () => {
    expect(progressPercent(199, 200)).toBe(99);
    expect(progressPercent(200, 200)).toBe(100);
  });

  it('is 0 for a game without achievements', () => {
    expect(progressPercent(0, 0)).toBe(0);
  });
});
