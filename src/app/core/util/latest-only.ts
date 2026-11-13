/**
 * For async loads that can overlap (several callers reloading the same list): each load takes a ticket, and only
 * the most recent one may write its result. An older answer that arrives late is dropped.
 *
 *   const isLatest = this.latest.start();
 *   const data = await fetch();
 *   if (isLatest()) this.list.set(data);
 */
export class LatestOnly {
  private ticket = 0;

  start(): () => boolean {
    const mine = ++this.ticket;
    return () => mine === this.ticket;
  }
}
