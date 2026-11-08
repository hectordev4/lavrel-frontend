import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlayerRow } from './player-row';

describe('PlayerRow', () => {
  it('links to the profile and shows the id in fours and the country', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PlayerRow);
    fixture.componentRef.setInput('player', {
      publicId: 1895582819150483,
      username: 'hectordev4',
      memberSince: '2026-11',
      country: { code: 'ES', name: 'Spain' },
      platforms: null,
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/players/1895582819150483');
    expect(el.textContent).toContain('ID 1895 5828 1915 0483 · Spain');
  });
});
