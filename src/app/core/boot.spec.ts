import { AppBoot } from './boot';

describe('AppBoot', () => {
  it('reports a page opened right after the splash, and not later', () => {
    vi.useFakeTimers();
    const boot = new AppBoot();
    expect(boot.cameFromSplash()).toBe(false);
    boot.markSplashEnded();
    expect(boot.cameFromSplash()).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(boot.cameFromSplash()).toBe(false);
    vi.useRealTimers();
  });
});
