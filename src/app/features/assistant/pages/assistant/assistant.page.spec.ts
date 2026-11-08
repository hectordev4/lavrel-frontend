import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssistantPage } from './assistant.page';

describe('AssistantPage', () => {
  it('explains how to get a guide', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AssistantPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('tap Guide');
  });
});
