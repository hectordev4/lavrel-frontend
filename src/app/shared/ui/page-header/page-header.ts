import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** A screen's top line: a plain back arrow, an optional small kicker, the title, and anything projected under it. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="heading">
      <a class="icon-btn" [routerLink]="backLink()" [attr.aria-label]="backLabel()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </a>
      <div class="titles">
        @if (kicker()) {
          <span class="kicker">{{ kicker() }}</span>
        }
        <h1>{{ heading() }}</h1>
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly backLink = input.required<string>();
  readonly backLabel = input('Back');
  readonly kicker = input('');
}
