import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { trackedGame } from '../../../../../testing/fixtures';
import { TrackedCard } from './tracked-card';

function render(game = trackedGame(1)) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(TrackedCard);
  fixture.componentRef.setInput('game', game);
  fixture.detectChanges();
  return fixture;
}

describe('TrackedCard', () => {
  it('links by slug and shows the progress', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.querySelector('.title')!.getAttribute('href')).toBe('/games/game-1');
    expect(el.textContent).toContain('5 of 10 unlocked');
  });

  it('emits status changes, pin toggles and removal', () => {
    const fixture = render(trackedGame(1, { pinPosition: 1 }));
    const el = fixture.nativeElement as HTMLElement;
    const status = vi.fn();
    const pin = vi.fn();
    const remove = vi.fn();
    fixture.componentInstance.statusChange.subscribe(status);
    fixture.componentInstance.pinToggle.subscribe(pin);
    fixture.componentInstance.remove.subscribe(remove);

    const select = el.querySelector('select')!;
    select.value = 'DROPPED';
    select.dispatchEvent(new Event('change'));
    const pinButton = el.querySelector('.icon-action.pinned') as HTMLButtonElement;
    expect(pinButton.getAttribute('aria-pressed')).toBe('true');
    pinButton.click();
    (el.querySelector('.menu-panel button') as HTMLButtonElement).click();

    expect(status).toHaveBeenCalledWith('DROPPED');
    expect(pin).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('blurs hidden next achievements until tapped', () => {
    const fixture = render(
      trackedGame(1, { nextAchievements: [{ achievementId: 9, name: 'Secret', iconUrl: null, hidden: true, globalPercent: 40 }] }),
    );
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.reveal') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.blur')).toBeNull();
    expect(el.textContent).toContain('Secret');
  });
});
