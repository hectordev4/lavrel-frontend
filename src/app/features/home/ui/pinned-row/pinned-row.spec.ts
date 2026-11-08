import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { trackedGame } from '../../../../../testing/fixtures';
import { PinnedRow } from './pinned-row';

describe('PinnedRow', () => {
  it('shows the percentage, or the diamond when complete', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PinnedRow);
    fixture.componentRef.setInput('game', trackedGame(1, { unlocked: 10, total: 10 }));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-perfect-diamond')).not.toBeNull();
    expect(el.textContent).toContain('10 / 10 achievements');
  });
});
