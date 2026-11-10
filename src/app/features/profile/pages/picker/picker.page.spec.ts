import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { testProviders } from '../../../../../testing/test-env';
import { PickerPage } from './picker.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render() {
  TestBed.configureTestingModule({
    providers: testProviders({ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ shelfId: 's1' }) } } }),
  });
  const fixture = TestBed.createComponent(PickerPage);
  fixture.detectChanges();
  TestBed.inject(HttpTestingController)
    .expectOne('/api/currentuser/profile/shelves')
    .flush({
      shelves: [
        {
          id: 's1',
          type: 'ACHIEVEMENTS',
          title: null,
          position: 1,
          collectionId: null,
          achievementIds: [10],
          achievements: [{ achievementId: 10, name: 'Phoenix Rising', iconUrl: null, gameId: 7, gameTitle: 'Hades', gameSlug: 'hades', globalPercent: 2.3, unlockedAt: null }],
        },
      ],
    });
  await settle();
  fixture.detectChanges();
  return fixture;
}

describe('PickerPage', () => {
  it('shows the count, the picks in the tray, and saves only after a change', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.count')!.textContent).toContain('1 of 12 picked');
    expect((el.querySelector('.save') as HTMLButtonElement).disabled).toBe(true);

    (el.querySelector('.count') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.tray')!.textContent).toContain('Phoenix Rising');
    expect(el.querySelector('.tray')!.textContent).toContain('Hades');

    (el.querySelector('[aria-label="Remove Phoenix Rising"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((el.querySelector('.save') as HTMLButtonElement).disabled).toBe(false);
  });

  it('asks before leaving with unsaved picks, and saves then returns to Profile', async () => {
    const fixture = await render();
    const page = fixture.componentInstance;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    expect(page.canLeave()).toBe(true);
    (fixture.nativeElement.querySelector('.count') as HTMLButtonElement).click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[aria-label="Remove Phoenix Rising"]') as HTMLButtonElement).click();
    expect(page.canLeave()).toBe(false);
    expect(confirmSpy).toHaveBeenCalled();

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.save') as HTMLButtonElement).click();
    await settle();
    TestBed.inject(HttpTestingController).expectOne('/api/currentuser/profile/shelves/s1/achievements').flush({});
    await settle();
    expect(navigate).toHaveBeenCalledWith('/profile');
  });
});
