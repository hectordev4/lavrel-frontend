import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PerfectDiamond } from '../../../../shared/ui/perfect-diamond/perfect-diamond';
import { MemberStats } from '../../../../core/api/models/member-stats.model';

/** Three totals: achievements unlocked, average completion ("—" before any unlock), perfect games. */
@Component({
  selector: 'app-stats-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, PerfectDiamond],
  templateUrl: './stats-row.html',
  styleUrl: './stats-row.scss',
})
export class StatsRow {
  readonly stats = input.required<MemberStats>();
}
