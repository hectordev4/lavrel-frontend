import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { GameChat } from './game-chat';

const settle = () => new Promise((resolve) => setTimeout(resolve));
const answer = (text: string) => ({ status: 'READY', text, grounded: true, sources: [], saved: false, createdAt: null, curated: false });

describe('GameChat', () => {
  let chat: GameChat;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testProviders(GameChat) });
    chat = TestBed.inject(GameChat);
    http = TestBed.inject(HttpTestingController);
    chat.open(7);
    http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 0, dailyLimit: null, unlimited: true });
    await settle();
  });

  it('sends the whole conversation each time, ending with the new question', async () => {
    const first = chat.send('Where do I start?');
    http.expectOne('/api/games/7/chat').flush(answer('In the **harbor**.'));
    await first;
    await settle();
    http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 0, dailyLimit: null, unlimited: true });

    const second = chat.send('And then?');
    const req = http.expectOne('/api/games/7/chat');
    expect(req.request.body.messages).toEqual([
      { role: 'user', content: 'Where do I start?' },
      { role: 'assistant', content: 'In the **harbor**.' },
      { role: 'user', content: 'And then?' },
    ]);
    expect(req.request.body.lang).toMatch(/^[a-z]{2}$/);
    req.flush(answer('The lighthouse.'));
    await second;
    expect(chat.messages().length).toBe(4);
  });

  it('knows an admin is unlimited', () => {
    expect(chat.unlimited()).toBe(true);
    expect(chat.left()).toBeNull();
  });
});
