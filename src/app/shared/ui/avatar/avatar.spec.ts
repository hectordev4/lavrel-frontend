import { TestBed } from '@angular/core/testing';
import { pixelbotUrl } from '../../utils/avatar-art';
import { Avatar } from './avatar';


function render(inputs: Record<string, unknown>) {
  const fixture = TestBed.createComponent(Avatar);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return fixture;
}

describe('Avatar', () => {
  it('shows an upload as it is', () => {
    const fixture = render({ avatar: { kind: 'UPLOADED', galleryId: null, url: 'https://cdn/me.gif' }, seed: '1' });
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('https://cdn/me.gif');
  });

  it('shows the initial, then the generated robot', async () => {
    const fixture = render({ avatar: null, seed: '4829103755210846', initial: 'S' });
    expect(fixture.nativeElement.querySelector('.initial').textContent).toBe('S');
    await pixelbotUrl('4829103755210846');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toContain('data:image/svg+xml');
  });

  it('has an accessible name only when given one', () => {
    const fixture = render({ seed: '1', label: 'Your avatar' });
    expect(fixture.nativeElement.querySelector('.frame').getAttribute('aria-label')).toBe('Your avatar');
  });
});
