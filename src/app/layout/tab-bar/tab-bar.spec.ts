import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { TabBar } from './tab-bar';

@Component({ template: '' })
class Blank {}

async function activeAt(url: string): Promise<string[]> {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
  const fixture = TestBed.createComponent(TabBar);
  await TestBed.inject(Router).navigateByUrl(url);
  fixture.detectChanges();
  return [...fixture.nativeElement.querySelectorAll('a.active')].map((a: Element) => a.textContent!.trim());
}

describe('TabBar', () => {
  it.each([
    ['/home', 'Home'],
    ['/games', 'Games'],
    ['/library', 'Games'],
    ['/search/results?q=doom', 'Search'],
    ['/profile', 'Profile'],
    ['/players', 'Search'],
    ['/players/1895582819150483', 'Search'],
  ])('lights %s as %s', async (url, tab) => {
    expect(await activeAt(url)).toEqual([tab]);
  });

  it('lights no tab on a game page', async () => {
    expect(await activeAt('/games/rogue-harbor')).toEqual([]);
  });

  it('marks the active tab as the current page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    const fixture = TestBed.createComponent(TabBar);
    await TestBed.inject(Router).navigateByUrl('/home');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a.active').getAttribute('aria-current')).toBe('page');
  });
});
