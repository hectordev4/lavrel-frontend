import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';

/** The AI tab: for now, how to get a guide for an achievement. Open chat comes once the backend supports it. */
@Component({
  selector: 'app-assistant-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard],
  templateUrl: './assistant.page.html',
  styleUrl: './assistant.page.scss',
})
export class AssistantPage {}
