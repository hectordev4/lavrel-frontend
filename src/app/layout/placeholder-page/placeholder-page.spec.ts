import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  it('names the screen and the branch that brings it', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ heading: 'Search', branch: 'feat/search' }) },
        },
      ],
    });
    const fixture = TestBed.createComponent(PlaceholderPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Search');
    expect(fixture.nativeElement.querySelector('code').textContent).toBe('feat/search');
  });
});
