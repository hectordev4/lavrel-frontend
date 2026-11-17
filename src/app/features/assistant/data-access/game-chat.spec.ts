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

  describe('when a question fails', () => {
    const fail = (status: number, error: object | null = null) =>
      http.expectOne('/api/games/7/chat').flush(error, { status, statusText: 'x' });

    it('takes the question back out and gives its text back', async () => {
      const long = 'x'.repeat(600);
      const sending = chat.send(`  ${long} `);
      expect(chat.messages().map((m) => m.text)).toEqual([long]); // shown while it's on its way
      fail(400, { error: 'invalid_question', message: 'A question has at most 500 characters' });

      expect(await sending).toBe(long);
      expect(chat.messages()).toEqual([]);
      expect(chat.error()).not.toBeNull();
      expect(chat.answering()).toBe(false);
    });

    it('never sends the failed question again with the next one', async () => {
      const first = chat.send('Where do I start?');
      http.expectOne('/api/games/7/chat').flush(answer('In the harbor.'));
      await first;
      await settle();
      http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 0, dailyLimit: null, unlimited: true });

      const failed = chat.send('Way too long');
      fail(400, { error: 'invalid_question' });
      expect(await failed).toBe('Way too long');
      expect(chat.messages().map((m) => m.role)).toEqual(['user', 'assistant']);

      const next = chat.send('And then?');
      const req = http.expectOne('/api/games/7/chat');
      expect(req.request.body.messages).toEqual([
        { role: 'user', content: 'Where do I start?' },
        { role: 'assistant', content: 'In the harbor.' },
        { role: 'user', content: 'And then?' },
      ]);
      req.flush(answer('The lighthouse.'));
      expect(await next).toBeNull();
      expect(chat.error()).toBeNull();
    });

    it('does the same when the assistant is down or there is no connection', async () => {
      for (const status of [503, 0]) {
        const sending = chat.send('Any tips?');
        fail(status, status ? { error: 'assistant_unavailable' } : null);
        expect(await sending).toBe('Any tips?');
        expect(chat.messages()).toEqual([]);
      }
    });

    it('resolves to null for an answered, empty or overlapping question', async () => {
      expect(await chat.send('   ')).toBeNull();
      const first = chat.send('One');
      expect(await chat.send('Two')).toBeNull(); // ignored while One is on its way
      http.expectOne('/api/games/7/chat').flush(answer('Ok.'));
      expect(await first).toBeNull();
      await settle();
      http.match('/api/currentuser/assistant/usage');
    });
  });
});
