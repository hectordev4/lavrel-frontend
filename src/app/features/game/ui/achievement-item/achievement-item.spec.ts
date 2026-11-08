import { provideRouter } from '@angular/router';
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

describe('AchievementItem guide button', () => {
  it('links members to the AI guide, hiding a hidden achievement’s name', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AchievementItem);
    fixture.componentRef.setInput('achievement', achievement(42, { hidden: true, name: 'Behind the Waterfall' }));
    fixture.componentRef.setInput('guideFor', { gameId: 7, slug: 'rogue-harbor', title: 'Rogue Harbor' });
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.guide') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/assistant/guide/7/42?');
    expect(link.getAttribute('href')).toContain('hidden=1');
    expect(link.getAttribute('aria-label')).toBe('AI guide for this hidden achievement');
  });

  it('has no Guide button for guests', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AchievementItem);
    fixture.componentRef.setInput('achievement', achievement(1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.guide')).toBeNull();
  });
});
