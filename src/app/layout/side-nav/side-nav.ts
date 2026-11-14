import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Wordmark } from '../../shared/ui/wordmark/wordmark';
import { activeTabPath } from '../active-tab';
import { TABS } from '../tab-bar/tabs';

/** Desktop navigation: the wordmark and the same four tabs as the phone's bottom bar, down the left side. */
@Component({
  selector: 'app-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Wordmark],
  template: `
    <nav aria-label="Main">
      <a class="brand" routerLink="/home" aria-label="Lavrel home"><app-wordmark mode="still" /></a>
      @for (tab of tabs; track tab.path) {
        <a
          [routerLink]="tab.path"
          class="tab"
          [class.active]="activePath() === tab.path"
          [attr.aria-current]="activePath() === tab.path ? 'page' : null"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="tab.icon" /></svg>
          <span>{{ tab.label }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './side-nav.scss',
})
export class SideNav {
  protected readonly tabs = TABS;
  protected readonly activePath = activeTabPath();
}
