import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/** Stands in for a tab whose feature branch hasn't landed yet. Route data: title, branch. */
@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
})
export class PlaceholderPage {
  protected readonly data = toSignal(
    inject(ActivatedRoute).data.pipe(
      map((d) => ({ title: d['heading'] as string, branch: d['branch'] as string })),
    ),
    { requireSync: true },
  );
}
