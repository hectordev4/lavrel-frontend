/**
 * jsdom has no <dialog> behaviour. Same stand-in for every spec (the prototype is shared between test files):
 * showModal opens, close closes and fires "close" like a browser does.
 */
export function installDialogStandIn(): void {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
