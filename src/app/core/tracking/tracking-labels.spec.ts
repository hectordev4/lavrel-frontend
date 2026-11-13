import { isTrackingStatus } from './tracking-labels';

describe('isTrackingStatus', () => {
  it('accepts the four statuses only', () => {
    expect(isTrackingStatus('BACKLOG')).toBe(true);
    expect(isTrackingStatus('STOP')).toBe(false);
  });
});
