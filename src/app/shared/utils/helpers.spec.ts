import { greetingFor } from './greeting';
import { formatPlayerId } from './player-id';
import { isRare } from './rarity';
import { syncedLabel } from './synced-label';

describe('shared helpers', () => {
  it('groups a player id in fours, from a number or a string', () => {
    expect(formatPlayerId(1895582819150483)).toBe('1895 5828 1915 0483');
    expect(formatPlayerId('4829103755210846')).toBe('4829 1037 5521 0846');
    expect(formatPlayerId(null)).toBe('');
  });

  it('calls under 5% rare', () => {
    expect(isRare(4.9)).toBe(true);
    expect(isRare(5)).toBe(false);
    expect(isRare(null)).toBe(false);
  });

  it('says when it last synced', () => {
    expect(syncedLabel(null)).toBe('not synced yet');
    expect(syncedLabel(new Date().toISOString())).toBe('synced just now');
  });

  it('greets by the hour', () => {
    expect(greetingFor(new Date(2026, 0, 1, 9))).toBe('Good morning,');
    expect(greetingFor(new Date(2026, 0, 1, 22))).toBe('Good evening,');
  });
});
