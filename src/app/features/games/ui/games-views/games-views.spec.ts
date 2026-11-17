import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { GamesViews } from './games-views';

/** Stands in for the Tracked and My library pages: each shows the nav, as the real ones do. */
@Component({ imports: [GamesViews], template: '<app-games-views />' })
class ViewPage {}

async function at(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'games', component: ViewPage },
        { path: 'library', component: ViewPage },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create(url);
  const links = () => [...harness.routeNativeElement!.querySelectorAll('a')] as HTMLAnchorElement[];
  const link = (label: string) => links().find((a) => a.textContent!.trim() === label)!;
  return { harness, links, link };
}

describe('GamesViews', () => {
  it('links both views with real addresses', async () => {
    const { links } = await at('/games');
    expect(links().map((a) => [a.textContent!.trim(), a.getAttribute('href')])).toEqual([
      ['Tracked', '/games'],
      ['My library', '/library'],
    ]);
  });

  it('marks the view of the current address', async () => {
    const { link } = await at('/library');
    expect(link('My library').classList).toContain('on');
    expect(link('My library').getAttribute('aria-current')).toBe('page');
    expect(link('Tracked').classList).not.toContain('on');
    expect(link('Tracked').hasAttribute('aria-current')).toBe(false);
  });

  it('goes both ways: My library → Tracked → My library', async () => {
    const { harness, link } = await at('/library');
    link('Tracked').click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/games');
    expect(link('Tracked').getAttribute('aria-current')).toBe('page');

    link('My library').click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/library');
    expect(link('My library').classList).toContain('on');
  });
});
