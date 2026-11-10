import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-env';
import { ShelvesSection } from './shelves-section';
import { installDialogStandIn } from '../../../../../testing/dialog';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render(shelves: object[]) {
  installDialogStandIn();
  TestBed.configureTestingModule({ providers: testProviders() });
  const fixture = TestBed.createComponent(ShelvesSection);
  fixture.detectChanges();
  TestBed.inject(HttpTestingController).expectOne('/api/currentuser/profile/shelves').flush({ shelves });
  await settle();
  fixture.detectChanges();
  return fixture;
}

const shelf = (id: string, type: string, position: number, title: string | null = null) => ({
  id,
  type,
  title,
  position,
  collectionId: null,
  achievementIds: [],
});

describe('ShelvesSection', () => {
  it('lists the shelves in order, each with a drag handle, a tappable name and a bin', async () => {
    const fixture = await render([shelf('b', 'STATS', 2), shelf('a', 'PLAYING', 1, 'Now')]);
    const el = fixture.nativeElement as HTMLElement;
    const names = [...el.querySelectorAll('.list .name')].map((n) => n.textContent!.trim());
    expect(names).toEqual(['Now', 'At a glance']);
    expect(el.querySelectorAll('.handle').length).toBe(2);
    expect(el.querySelector('[aria-label="Remove Now"]')).not.toBeNull();
    expect(el.textContent).toContain('2 of 10');
  });

  it('moves a shelf with the arrow keys on its handle', async () => {
    const fixture = await render([shelf('a', 'PLAYING', 1, 'Now'), shelf('b', 'STATS', 2)]);
    const handle = fixture.nativeElement.querySelector('.handle') as HTMLButtonElement;
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await settle();
    const req = TestBed.inject(HttpTestingController).expectOne((r) => r.method === 'PUT');
    expect(req.request.body).toEqual({ shelfIds: ['b', 'a'] });
  });

  it('asks before removing, in a sheet', async () => {
    const fixture = await render([shelf('a', 'COLLECTION', 1, 'Cozy')]);
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[aria-label="Remove Cozy"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.tick();
    expect(el.textContent).toContain('The collection itself and its games stay in your library.');
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'DELETE');
    ([...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Remove shelf') as HTMLButtonElement).click();
    await settle();
    TestBed.inject(HttpTestingController).expectOne((r) => r.method === 'DELETE' && r.url.endsWith('/a')).flush(null);
  });

  it('opens the title sheet when the name is tapped', async () => {
    const fixture = await render([shelf('a', 'PLAYING', 1, 'Now')]);
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.name') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.tick();
    const dialogs = [...el.querySelectorAll('dialog')].filter((d) => d.querySelector('h2')!.textContent === 'Shelf title');
    expect((dialogs[0].querySelector('input') as HTMLInputElement).value).toBe('Now');
  });

  it('only offers types not used yet, collections always', async () => {
    const fixture = await render([shelf('a', 'PLAYING', 1), shelf('b', 'STATS', 2)]);
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.add') as HTMLButtonElement).click();
    TestBed.inject(HttpTestingController).expectOne('/api/currentuser/collections').flush({ collections: [] });
    await settle();
    fixture.detectChanges();
    const types = [...el.querySelectorAll('.type .name')].map((n) => n.textContent);
    expect(types).toEqual(['Collection', 'Recently played', 'Completed', 'Achievements']);
  });

  it('says when the shelves are full', async () => {
    const ten = Array.from({ length: 10 }, (_, i) => shelf(`s${i}`, 'COLLECTION', i + 1, `C${i}`));
    const fixture = await render(ten);
    const add = fixture.nativeElement.querySelector('.add') as HTMLButtonElement;
    expect(add.disabled).toBe(true);
    expect(add.textContent).toContain('Shelves are full');
  });
});

describe('ShelvesSection Pick link', () => {
  it('opens the picker page for an achievements shelf', async () => {
    const fixture = await render([{ id: 'a', type: 'ACHIEVEMENTS', title: null, position: 1, collectionId: null, achievementIds: [1, 2] }]);
    const link = [...fixture.nativeElement.querySelectorAll('a')].find((a: Element) => a.textContent!.trim() === 'Pick') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/profile/shelves/a/achievements');
    expect(fixture.nativeElement.textContent).toContain('2 picked');
  });
});
