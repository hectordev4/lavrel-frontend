import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { installDialogStandIn } from '../../../../testing/dialog';

describe('Modal', () => {
  beforeAll(() => {
    // jsdom has no <dialog> behaviour.
    installDialogStandIn();
  });

  it('opens with its heading and emits closed when dismissed', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('heading', 'New collection');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    TestBed.tick();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.textContent).toBe('New collection');
    expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2')!.id);

    const spy = vi.fn();
    fixture.componentInstance.closed.subscribe(spy);
    (fixture.nativeElement.querySelector('.close') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('closes on a tap on the dimmed page around it, not on a tap inside', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('heading', 'Remove this shelf?');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    TestBed.tick();
    const spy = vi.fn();
    fixture.componentInstance.closed.subscribe(spy);
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    (dialog.querySelector('h2') as HTMLElement).click();
    expect(spy).not.toHaveBeenCalled();
    dialog.click();
    expect(spy).toHaveBeenCalledOnce();
  });
});
