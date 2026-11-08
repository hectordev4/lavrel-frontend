import { TestBed } from '@angular/core/testing';
import { achievement } from '../../../../../testing/fixtures';
import { AchievementItem } from './achievement-item';

function render(a: ReturnType<typeof achievement>, personal = false) {
  const fixture = TestBed.createComponent(AchievementItem);
  fixture.componentRef.setInput('achievement', a);
  fixture.componentRef.setInput('personal', personal);
  fixture.detectChanges();
  return fixture;
}

describe('AchievementItem', () => {
  it('blurs a hidden achievement until revealed', () => {
    const fixture = render(achievement(1, { hidden: true }));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.blur')).not.toBeNull();
    const spy = vi.fn();
    fixture.componentInstance.reveal.subscribe(spy);
    (el.querySelector('.reveal') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('never blurs a hidden achievement you unlocked', () => {
    const el = render(achievement(1, { hidden: true, unlocked: true }), true).nativeElement as HTMLElement;
    expect(el.querySelector('.blur')).toBeNull();
  });

  it('shows the country figure only when signed in, with — when unknown', () => {
    expect((render(achievement(1)).nativeElement as HTMLElement).textContent).not.toContain('in your country');
    TestBed.resetTestingModule();
    expect((render(achievement(1), true).nativeElement as HTMLElement).textContent).toContain('— in your country');
  });
});
