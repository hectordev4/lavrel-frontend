import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { startApp } from './integration-app';

const box = 'Ask about Hades';

/**
 * Integration: the AI chat with a backend that, like the real one, refuses the whole conversation when any of its
 * questions is longer than 500 characters. A failed question must leave the thread, or it blocks every next one.
 */
describe('Integration · AI chat', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const chats = (app: Awaited<ReturnType<typeof startApp>>) =>
    app.backend.requests.filter((r) => r.url === '/api/games/1/chat');
  const sent = (app: Awaited<ReturnType<typeof startApp>>, i: number) =>
    (chats(app)[i].body as { messages: { role: string; content: string }[] }).messages;

  it('gives a rejected question back to edit, and never sends it again', async () => {
    const app = await startApp();
    await app.visit('/assistant/chat/1?game=Hades');
    expect(app.input(box).getAttribute('maxlength')).toBe('500');

    // A question too long for the backend (pasted past the box's limit, as the old 1000-character box allowed).
    const long = 'Where is the key? '.repeat(40).trim();
    await app.type(box, long);
    await app.submit(box);

    expect(app.messages()).toContain('A question has at most 500 characters');
    expect(app.el.querySelector('.question')).toBeNull();
    expect(app.input(box).value).toBe(long);

    // Shortened, it goes through: only that question is sent.
    await app.type(box, 'Where is the key?');
    await app.submit(box);
    expect(sent(app, 1)).toEqual([{ role: 'user', content: 'Where is the key?' }]);
    expect(app.text()).toContain('About Where is the key?');

    // And the conversation carries on with answered questions only.
    await app.type(box, 'And the door?');
    await app.submit(box);
    expect(sent(app, 2).map((m) => m.content)).toEqual([
      'Where is the key?',
      'About Where is the key?',
      'And the door?',
    ]);
    expect(app.messages()).toEqual([]);
  });

  it('gives the question back after the assistant fails once, then sends it alone', async () => {
    const app = await startApp();
    await app.visit('/assistant/chat/1?game=Hades');
    app.backend.failNext('POST', /^\/api\/games\/1\/chat$/, 503, 'assistant_unavailable');

    await app.type(box, 'Any tips for the first boss?');
    await app.submit(box);
    expect(app.input(box).value).toBe('Any tips for the first boss?');
    expect(app.el.querySelector('.question')).toBeNull();

    await app.submit(box);
    expect(sent(app, 1)).toEqual([{ role: 'user', content: 'Any tips for the first boss?' }]);
    expect(app.text()).toContain('About Any tips for the first boss?');
  });
});
