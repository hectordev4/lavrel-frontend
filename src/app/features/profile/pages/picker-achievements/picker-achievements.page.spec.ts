import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { testProviders } from '../../../../../testing/test-env';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { PickerAchievementsPage } from './picker-achievements.page';

describe('PickerAchievementsPage', () => {
  it('lists the game’s unlocks rarest first, marks rare ones, and ticks them into the picks', () => {
    TestBed.configureTestingModule({
      providers: testProviders(ShelfPicker, {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ gameId: '7' }) } },
      }),
    });
    TestBed.inject(ShelfPicker).games.set(7, {
      gameId: 7,
      title: 'Hades',
      slug: 'hades',
      coverImageUrl: null,
      unlocked: 2,
      total: 49,
      lastUnlockedAt: null,
    });
    const fixture = TestBed.createComponent(PickerAchievementsPage);
    fixture.detectChanges();
    const req = TestBed.inject(HttpTestingController).expectOne(
      (r) => r.url === '/api/currentuser/games/7/achievements/unlocked',
    );
    expect(req.request.params.get('sort')).toBe('rarity');
    req.flush({
      gameId: 7,
      achievements: [
        {
          achievementId: 812,
          name: 'Rare one',
          iconUrl: null,
          hidden: true,
          globalPercent: 2.3,
          unlockedAt: null,
        },
        {
          achievementId: 813,
          name: 'Common one',
          iconUrl: null,
          hidden: false,
          globalPercent: 60,
          unlockedAt: null,
        },
      ],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')!.textContent).toBe('Hades');
    expect(el.querySelector('li')!.classList).toContain('rare');
    (el.querySelector('input') as HTMLInputElement).click();
    expect(
      TestBed.inject(ShelfPicker)
        .picked()
        .map((p) => [p.name, p.gameTitle]),
    ).toEqual([['Rare one', 'Hades']]);
  });
});

describe('PickerAchievementsPage order switches', () => {
  it('cancels the older order’s request, so the list matches the selected toggle', () => {
    TestBed.configureTestingModule({
      providers: testProviders(ShelfPicker, {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ gameId: '7' }) } },
      }),
    });
    const fixture = TestBed.createComponent(PickerAchievementsPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const rarity = http.expectOne((r) => r.params.get('sort') === 'rarity');
    (
      [...fixture.nativeElement.querySelectorAll('.segmented button')][1] as HTMLButtonElement
    ).click();
    const date = http.expectOne((r) => r.params.get('sort') === 'date');
    expect(rarity.cancelled).toBe(true);
    date.flush({ gameId: 7, achievements: [] });
  });
});
