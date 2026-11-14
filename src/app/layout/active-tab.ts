import { Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Tab } from './models/tab.model';
import { TABS } from './tab-bar/tabs';

/**
 * The path of the tab to light for the current address, or null (a game page, Profile…). Shared by the bottom
 * tab bar (phone) and the side navigation (desktop). Call it in an injection context.
 */
export function activeTabPath(): Signal<string | null> {
  const router = inject(Router);
  const path = toSignal(
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => pathOf(e.urlAfterRedirects)),
    ),
    { initialValue: pathOf(router.url) },
  );
  return computed(() => TABS.find((tab) => isActive(tab, path()))?.path ?? null);
}

function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}

function isActive(tab: Tab, path: string): boolean {
  return tab.activeOn
    ? tab.activeOn.test(path)
    : path === tab.path || path.startsWith(tab.path + '/');
}
