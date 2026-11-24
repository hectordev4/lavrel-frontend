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
    expect(el.querySelector('.sources .toggle')!.textContent!.trim()).toBe('1 source');
    (el.querySelector('.sources .toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.row .site')!.textContent).toBe('w.fandom.com');
    expect(el.textContent).toContain('Is there anything else I can help with?');
  });

  describe('the question box', () => {
    async function render() {
      TestBed.configureTestingModule({
        providers: testProviders({
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ gameId: '7' }), queryParamMap: convertToParamMap({ game: 'Rogue Harbor' }) } },
        }),
      });
      const fixture = TestBed.createComponent(ChatPage);
      fixture.detectChanges();
      const http = TestBed.inject(HttpTestingController);
      http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 3, dailyLimit: 20 });
      await settle();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const box = el.querySelector('textarea')!;
      const type = (text: string) => {
        box.value = text;
        box.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      };
      const submit = () => {
        el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        fixture.detectChanges();
      };
      return { fixture, http, el, box, type, submit };
    }

    it('allows 500 characters, like the backend', async () => {
      const { box } = await render();
      expect(box.getAttribute('maxlength')).toBe('500');
    });

    it('counts characters near the limit', async () => {
      const { el, type } = await render();
      type('x'.repeat(399));
      expect(el.querySelector('.count')).toBeNull();
      type('x'.repeat(420));
      expect(el.querySelector('.count')!.textContent!.trim()).toBe('420 / 500');
      expect(el.querySelector('.count')!.classList).not.toContain('full');
      type('x'.repeat(500));
      expect(el.querySelector('.count')!.classList).toContain('full');
    });

    it('puts a failed question back in the box, out of the thread', async () => {
      const { fixture, http, el, box, type, submit } = await render();
      type('Where is the key?');
      submit();
      expect(box.value).toBe('');
      expect(el.querySelector('.question')!.textContent).toBe('Where is the key?');

      http.expectOne('/api/games/7/chat').flush({ error: 'assistant_unavailable' }, { status: 503, statusText: 'x' });
      await settle();
      fixture.detectChanges();
      expect(box.value).toBe('Where is the key?');
      expect(el.querySelector('.question')).toBeNull();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();
    });

    it('keeps the question in the box when Enter is pressed while an answer is on its way', async () => {
      const { http, box, type, submit } = await render();
      type('First');
      submit();
      type('Second');
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(box.value).toBe('Second');
      expect(http.match('/api/games/7/chat').length).toBe(1);
    });
  });
});
