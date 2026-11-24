import { provideRouter, Router } from '@angular/router';
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
    const el = render(achievement(1, { hidden: true, unlocked: true }), true)
      .nativeElement as HTMLElement;
    expect(el.querySelector('.blur')).toBeNull();
  });

  it('shows the country figure only when signed in, with — when unknown', () => {
    expect((render(achievement(1)).nativeElement as HTMLElement).textContent).not.toContain(
      'in your country',
    );
    TestBed.resetTestingModule();
    expect((render(achievement(1), true).nativeElement as HTMLElement).textContent).toContain(
      '— in your country',
    );
  });
});

describe('AchievementItem guide button', () => {
  it('links members to the AI guide, hiding a hidden achievement’s name', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AchievementItem);
    fixture.componentRef.setInput(
      'achievement',
      achievement(42, { hidden: true, name: 'Behind the Waterfall' }),
    );
    fixture.componentRef.setInput('guideFor', {
      gameId: 7,
      slug: 'rogue-harbor',
      title: 'Rogue Harbor',
    });
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

  describe('a hidden achievement', () => {
    function hidden(guide = true) {
      const fixture = TestBed.createComponent(AchievementItem);
      fixture.componentRef.setInput(
        'achievement',
        achievement(1, { name: 'Lord of Cinder', hidden: true }),
      );
      if (guide)
        fixture.componentRef.setInput('guideFor', {
          gameId: 7,
          slug: 'ds3',
          title: 'Dark Souls III',
        });
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.reveal.subscribe(spy);
      return { fixture, el: fixture.nativeElement as HTMLElement, spy };
    }

    beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

    it('says why it is hidden, then what to do on the next line', () => {
      const { el } = hidden();
      const hint = el.querySelector('.hint')!;
      expect(hint.getAttribute('aria-hidden')).toBe('true');
      expect(hint.querySelector('svg')).not.toBeNull();
      expect(hint.querySelector('.why')!.textContent).toBe('Hidden to avoid spoilers');
      expect(hint.querySelector('.how')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'TapClick to reveal',
      );
      expect(hint.querySelector('.how .touch')!.textContent).toBe('Tap');
      expect(hint.querySelector('.how .mouse')!.textContent).toBe('Click');
      expect(el.querySelector('.desc')).toBeNull();
    });

    it('is one button for the whole row, named for screen readers, coming before Guide', () => {
      const { el } = hidden();
      const item = el.querySelector('.item')!;
      expect(item.classList).toContain('hidden-one');
      const button = item.querySelector('button.reveal')!;
      expect(item.firstElementChild).toBe(button);
      expect(button.textContent!.trim()).toBe(
        'Hidden achievement, may contain spoilers. Reveal it.',
      );
      expect(button.querySelector('.guide')).toBeNull();
      expect(el.querySelector('.guide')!.getAttribute('aria-label')).toBe(
        'AI guide for this hidden achievement',
      );
    });

    it('reveals from the row, but not from the Guide button', () => {
      // Stubbed so the Guide click doesn't start a real navigation that outlives the test.
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const { el, spy } = hidden();
      (el.querySelector('.guide') as HTMLAnchorElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      expect(navigate).toHaveBeenCalledOnce();
      expect(String(navigate.mock.calls[0][0])).toContain('/assistant/guide/7/1?');
      expect(spy).not.toHaveBeenCalled();
      (el.querySelector('.reveal') as HTMLButtonElement).click();
      expect(spy).toHaveBeenCalledOnce();
    });

    it('shows the name and description once revealed, without the hint or the button', () => {
      const { fixture, el } = hidden(false);
      fixture.componentRef.setInput('revealed', true);
      fixture.detectChanges();
      expect(el.querySelector('.reveal')).toBeNull();
      expect(el.querySelector('.hint')).toBeNull();
      expect(el.querySelector('.item')!.classList).not.toContain('hidden-one');
      expect(el.querySelector('.name')!.textContent).toBe('Lord of Cinder');
    });
  });
});
