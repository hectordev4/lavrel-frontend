import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';

/** What guests see on tabs that need an account (Games, Profile). Route data: heading, text. */
@Component({
  selector: 'app-sign-in-gate-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard],
  templateUrl: './sign-in-gate.page.html',
  styleUrl: './sign-in-gate.page.scss',
})
export class SignInGatePage {
  protected readonly copy = toSignal(
    inject(ActivatedRoute).data.pipe(map((d) => ({ heading: d['heading'] as string, text: d['text'] as string }))),
    { requireSync: true },
  );
}
