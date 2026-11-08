import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SignInGatePage } from './sign-in-gate.page';

describe('SignInGatePage', () => {
  it('shows the route’s heading and the two ways forward', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ heading: 'Your games live here', text: 'Sign in to track.' }) } },
      ],
    });
    const fixture = TestBed.createComponent(SignInGatePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')!.textContent).toBe('Your games live here');
    const links = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/welcome', '/search']);
  });
});
