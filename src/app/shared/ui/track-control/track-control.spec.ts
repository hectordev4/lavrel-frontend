import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TrackControl } from './track-control';

function render(inputs: Record<string, unknown>) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(TrackControl);
  fixture.componentRef.setInput('gameTitle', 'Rogue Harbor');
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return fixture;
}

describe('TrackControl', () => {
  it('asks guests to sign in', () => {
    const el = render({ signedIn: false }).nativeElement as HTMLElement;
    expect(el.querySelector('a')!.textContent).toContain('Sign in to track');
  });

  it('tracks as Playing from the Track button', () => {
    const fixture = render({ signedIn: true, status: null });
    const spy = vi.fn();
    fixture.componentInstance.track.subscribe(spy);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledWith('PLAYING');
  });

  it('changes status, or stops tracking, from the select', () => {
    const fixture = render({ signedIn: true, status: 'PLAYING' });
    const track = vi.fn();
    const untrack = vi.fn();
    fixture.componentInstance.track.subscribe(track);
    fixture.componentInstance.untrack.subscribe(untrack);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'COMPLETED';
    select.dispatchEvent(new Event('change'));
    select.value = 'STOP';
    select.dispatchEvent(new Event('change'));
    expect(track).toHaveBeenCalledWith('COMPLETED');
    expect(untrack).toHaveBeenCalledOnce();
  });

  it('shows the pin only in the full variant, pressed when pinned', () => {
    expect(render({ signedIn: true, status: 'PLAYING', variant: 'compact' }).nativeElement.querySelector('.pin')).toBeNull();
    TestBed.resetTestingModule();
    const pin = render({ signedIn: true, status: 'PLAYING', pinned: true }).nativeElement.querySelector('.pin');
    expect(pin.getAttribute('aria-pressed')).toBe('true');
  });
});
