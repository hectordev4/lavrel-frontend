import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { activeTabPath } from '../active-tab';
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
  protected readonly tabs = TABS;
  protected readonly activePath = activeTabPath();
}
