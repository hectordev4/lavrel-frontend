import { TestBed } from '@angular/core/testing';
import { GuestMode } from './guest-mode';

describe('GuestMode', () => {
  beforeEach(() => localStorage.clear());

  it('starts off', () => {
    expect(TestBed.inject(GuestMode).active()).toBe(false);
  });

  it('remembers "Skip for now" in this browser', () => {
    TestBed.inject(GuestMode).enable();
    expect(localStorage.getItem('lavrel.browsing-without-account')).toBe('true');
    TestBed.resetTestingModule();
    expect(TestBed.inject(GuestMode).active()).toBe(true);
  });

  it('forgets it on clear', () => {
    const guest = TestBed.inject(GuestMode);
    guest.enable();
    guest.clear();
    expect(guest.active()).toBe(false);
    expect(localStorage.getItem('lavrel.browsing-without-account')).toBeNull();
  });
});
