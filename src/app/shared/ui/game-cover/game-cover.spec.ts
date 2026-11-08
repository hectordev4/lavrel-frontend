import { TestBed } from '@angular/core/testing';
import { GameCover } from './game-cover';

describe('GameCover', () => {
  it('shows the image when there is one', () => {
    const fixture = TestBed.createComponent(GameCover);
    fixture.componentRef.setInput('title', 'Rogue Harbor');
    fixture.componentRef.setInput('src', 'https://img/cover.jpg');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://img/cover.jpg');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('falls back to the initials without an image, or when it fails', () => {
    const fixture = TestBed.createComponent(GameCover);
    fixture.componentRef.setInput('title', 'Rogue Harbor: Deluxe');
    fixture.componentRef.setInput('src', 'https://img/broken.jpg');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fallback').textContent.trim()).toBe('RH');
  });
});
