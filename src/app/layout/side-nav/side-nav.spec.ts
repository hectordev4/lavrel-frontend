import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SideNav } from './side-nav';

@Component({ template: '' })
class Blank {}

describe('SideNav', () => {
  it('lists the four tabs and lights the current one', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
    const fixture = TestBed.createComponent(SideNav);
    await TestBed.inject(Router).navigateByUrl('/library');
    fixture.detectChanges();
    const tabs = [...fixture.nativeElement.querySelectorAll('.tab')].map((a: Element) =>
      a.textContent!.trim(),
    );
    expect(tabs).toEqual(['Home', 'Search', 'AI', 'Games']);
    expect(fixture.nativeElement.querySelector('.tab.active').textContent.trim()).toBe('Games');
  });
});
