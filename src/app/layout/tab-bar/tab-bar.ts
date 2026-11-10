import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { Tab } from '../models/tab.model';
import { TABS } from './tabs';

/** Bottom navigation, always within thumb reach. */
@Component({
  selector: 'app-tab-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.scss',
})
export class TabBar {
  private readonly router = inject(Router);
  protected readonly tabs = TABS;

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => pathOf(e.urlAfterRedirects)),
    ),
    { initialValue: pathOf(this.router.url) },
  );
  protected readonly activePath = computed(() => this.tabs.find((tab) => isActive(tab, this.path()))?.path ?? null);
}

function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}

function isActive(tab: Tab, path: string): boolean {
  return tab.activeOn ? tab.activeOn.test(path) : path === tab.path || path.startsWith(tab.path + '/');
}
