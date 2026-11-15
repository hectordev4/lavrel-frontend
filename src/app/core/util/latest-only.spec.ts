import { LatestOnly } from './latest-only';

describe('LatestOnly', () => {
  it('lets only the most recent load write', () => {
    const latest = new LatestOnly();
    const first = latest.start();
    const second = latest.start();
    expect(first()).toBe(false);
    expect(second()).toBe(true);
  });
});
