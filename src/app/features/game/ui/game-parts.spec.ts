import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeAuthProvider, signInAs } from '../../../../testing/auth-testing';
import { gameDetails } from '../../../../testing/fixtures';
import { memberUser, testProviders } from '../../../../testing/test-env';
import { detailRows } from '../data-access/game-facts';
import { GameAbout } from './game-about/game-about';
import { GameLabels } from './game-labels/game-labels';
import { GameTracking } from './game-tracking/game-tracking';

describe('game page parts', () => {
  it('detailRows lists the filled details only', () => {
    const labels = detailRows(gameDetails({ franchises: [] })).map((r) => r.label);
    expect(labels).toEqual([
      'Developer',
      'Publisher',
      'Price',
      'Available on',
      'Player modes',
      'Controller',
    ]);
  });

  it('GameAbout folds a long description behind Read more', () => {
    const f = TestBed.createComponent(GameAbout);
    f.componentRef.setInput('description', 'x'.repeat(300));
    f.detectChanges();
    const button = f.nativeElement.querySelector('.link-btn') as HTMLButtonElement;
    expect(button.textContent!.trim()).toBe('Read more');
    button.click();
    f.detectChanges();
    expect(f.nativeElement.querySelector('.description').classList).toContain('open');
  });

  it('GameLabels shows 8 tags, then all', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    const f = TestBed.createComponent(GameLabels);
    f.componentRef.setInput(
      'tags',
      Array.from({ length: 10 }, (_, i) => ({ id: i, name: `T${i}`, weight: 1 })),
    );
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.pills li').length).toBe(8);
    (f.nativeElement.querySelector('.link-btn') as HTMLButtonElement).click();
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.pills li').length).toBe(10);
  });

  it('GameTracking tracks the game as Playing and offers Ask the AI to members', () => {
    TestBed.configureTestingModule({ providers: testProviders(fakeAuthProvider) });
    signInAs(memberUser());
    const f = TestBed.createComponent(GameTracking);
    f.componentRef.setInput('game', { id: 7, title: 'Rogue Harbor', slug: 'rogue-harbor' });
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/currentuser/tracked').flush({ games: [] });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Ask the AI about this game');
    (
      [...f.nativeElement.querySelectorAll('button')].find((b: Element) =>
        b.textContent!.includes('Track'),
      ) as HTMLButtonElement
    ).click();
    const put = http.expectOne('/api/currentuser/tracked/7');
    expect(put.request.body).toEqual({ status: 'PLAYING' });
  });
});
