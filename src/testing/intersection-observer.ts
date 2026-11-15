/**
 * jsdom has no IntersectionObserver, which @defer (on viewport) uses. This stand-in observes nothing, so deferred
 * blocks keep their placeholder in tests (their contents are tested in their own specs).
 */
export function installIntersectionObserverStandIn(): void {
  if (typeof globalThis.IntersectionObserver !== 'undefined') return;
  class NoIntersections {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = NoIntersections as unknown as typeof IntersectionObserver;
}
