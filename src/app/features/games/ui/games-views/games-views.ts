import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Switches between the Games tab's views: Tracked (/games) and My library (/library). One nav for both pages, with
 * its own router directives: which view is on (and aria-current) comes from the address, not from the page.
 */
@Component({
  selector: 'app-games-views',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './games-views.html',
  styleUrl: './games-views.scss',
})
export class GamesViews {
  protected readonly views = [
    { label: 'Tracked', link: '/games' },
    { label: 'My library', link: '/library' },
  ];
}
