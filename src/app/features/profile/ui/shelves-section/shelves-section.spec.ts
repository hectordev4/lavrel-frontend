import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../../testing/test-env';
import { ShelvesSection } from './shelves-section';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render(shelves: object[]) {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
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
  it('lists the shelves in order, with titles or type names, and can’t move past the ends', async () => {
    const fixture = await render([shelf('b', 'STATS', 2), shelf('a', 'PLAYING', 1, 'Now')]);
    const el = fixture.nativeElement as HTMLElement;
    const names = [...el.querySelectorAll('.list .name')].map((n) => n.textContent);
    expect(names).toEqual(['Now', 'At a glance']);
    expect((el.querySelector('[aria-label="Move Now up"]') as HTMLButtonElement).disabled).toBe(true);
    expect((el.querySelector('[aria-label="Move At a glance down"]') as HTMLButtonElement).disabled).toBe(true);
    expect(el.textContent).toContain('2 of 10');
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
