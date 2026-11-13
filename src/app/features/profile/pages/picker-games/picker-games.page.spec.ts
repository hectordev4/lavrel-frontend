import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-env';
import { ShelfPicker } from '../../data-access/shelf-picker';
import { PickerGamesPage } from './picker-games.page';

describe('PickerGamesPage', () => {
  it('lists games with unlocks, recent first, and switches to by name', () => {
    TestBed.configureTestingModule({ providers: testProviders(ShelfPicker) });
    const fixture = TestBed.createComponent(PickerGamesPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((r) => r.params.get('sort') === 'recent')
      .flush({
        games: [
          {
            gameId: 7,
            title: 'Hades',
            slug: 'hades',
            coverImageUrl: null,
            unlocked: 38,
            total: 49,
            lastUnlockedAt: null,
          },
        ],
        page: 0,
        size: 24,
        hasMore: false,
      });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('38 of 49 unlocked');
    expect(TestBed.inject(ShelfPicker).games.get(7)?.title).toBe('Hades');
    ([...el.querySelectorAll('.segmented button')][1] as HTMLButtonElement).click();
    http
      .expectOne((r) => r.params.get('sort') === 'name')
      .flush({ games: [], page: 0, size: 24, hasMore: false });
  });
});

describe('PickerGamesPage order switches', () => {
  it('cancels the older request when the order changes', () => {
    TestBed.configureTestingModule({ providers: testProviders(ShelfPicker) });
    const fixture = TestBed.createComponent(PickerGamesPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const recent = http.expectOne((r) => r.params.get('sort') === 'recent');
    (
      [...fixture.nativeElement.querySelectorAll('.segmented button')][1] as HTMLButtonElement
    ).click();
    expect(recent.cancelled).toBe(true);
    http
      .expectOne((r) => r.params.get('sort') === 'name')
      .flush({ games: [], page: 0, size: 24, hasMore: false });
  });
});
