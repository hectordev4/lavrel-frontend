import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { testProviders } from '../../../../../testing/test-env';
import { ChatPage } from './chat.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('ChatPage', () => {
  it('greets with starters, then answers with the follow-up line', async () => {
    TestBed.configureTestingModule({
      providers: testProviders({
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ gameId: '7' }), queryParamMap: convertToParamMap({ game: 'Rogue Harbor', slug: 'rogue-harbor' }) } },
      }),
    });
    const fixture = TestBed.createComponent(ChatPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 3, dailyLimit: 20 });
    await settle();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ask me anything about Rogue Harbor');
    expect(el.querySelector('a[aria-label="Back"]')!.getAttribute('href')).toBe('/assistant');

    (el.querySelector('.starter') as HTMLButtonElement).click();
    http
      .expectOne('/api/games/7/chat')
      .flush({ status: 'READY', text: 'Start at the docks!', grounded: true, sources: [{ title: 'Docks', url: 'https://w.fandom.com/Docks', license: 'CC BY-SA 3.0' }], saved: false, createdAt: null });
    await settle();
    fixture.detectChanges();
    expect(el.querySelector('.question')!.textContent).toBe('Where should I start?');
    expect(el.querySelector('.pill')!.textContent!.trim()).toBe('w.fandom.com');
    expect(el.textContent).toContain('Is there anything else I can help with?');
  });
});
