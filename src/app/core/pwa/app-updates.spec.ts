import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { UpdateBanner } from '../../layout/update-banner/update-banner';
import { AppUpdates, RELOAD_PAGE } from './app-updates';

describe('AppUpdates and the update banner', () => {
  it('offers Reload once a new version is ready, and activates it', async () => {
    const versionUpdates = new Subject<{ type: string }>();
    const activateUpdate = vi.fn().mockResolvedValue(true);
    const reload = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates, activateUpdate } },
        { provide: RELOAD_PAGE, useValue: reload },
      ],
    });
    const fixture = TestBed.createComponent(UpdateBanner);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner')).toBeNull();

    versionUpdates.next({ type: 'VERSION_READY' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('A new version of Lavrel is ready.');

    await TestBed.inject(AppUpdates).reload();
    expect(activateUpdate).toHaveBeenCalled();
    expect(reload).toHaveBeenCalled();
  });

  it('stays quiet where the service worker is off', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SwUpdate, useValue: { isEnabled: false } }],
    });
    expect(TestBed.inject(AppUpdates).ready()).toBe(false);
  });
});
