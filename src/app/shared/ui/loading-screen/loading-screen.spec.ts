import { TestBed } from '@angular/core/testing';
import { LoadingScreen } from './loading-screen';

describe('LoadingScreen', () => {
  it('announces its message as a status', () => {
    const fixture = TestBed.createComponent(LoadingScreen);
    fixture.componentRef.setInput('message', 'Signing you in');
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain('Signing you in');
  });
});
