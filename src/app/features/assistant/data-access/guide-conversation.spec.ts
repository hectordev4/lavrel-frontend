import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { GuideConversation } from './guide-conversation';

const settle = () => new Promise((resolve) => setTimeout(resolve));
const ready = (text: string, saved = false) => ({ status: 'READY', text, grounded: false, sources: [], saved, createdAt: null });

describe('GuideConversation', () => {
  let convo: GuideConversation;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders(GuideConversation) });
    convo = TestBed.inject(GuideConversation);
    http = TestBed.inject(HttpTestingController);
    convo.open(7, 42);
    http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 5, dailyLimit: 20 });
    return settle();
  });

  it('waits for the spoiler choice, then answers and counts the allowance', async () => {
    expect(convo.status()).toBe('choosing');
    expect(convo.left()).toBe(15);
    const done = convo.start(false);
    http.expectOne((r) => r.url.endsWith('/guide') && r.params.get('spoilers') === 'false').flush(ready('**Hint**'));
    await done;
    expect(convo.status()).toBe('ready');
    expect(convo.messages()[0]).toEqual({ role: 'assistant', html: expect.stringContaining('<strong>Hint</strong>'), grounded: false, sources: [] });
    await settle();
    http.expectOne('/api/currentuser/assistant/usage').flush({ usedToday: 6, dailyLimit: 20 });
    await settle();
    expect(convo.left()).toBe(14);
  });

  it('keeps the spoiler choice for follow-ups', async () => {
    const first = convo.start(true);
    http.expectOne((r) => r.url.endsWith('/guide')).flush(ready('Steps', true));
    await first;
    const next = convo.ask('  Is it missable? ');
    const req = http.expectOne((r) => r.url.endsWith('/questions'));
    expect(req.request.body.spoilers).toBe(true);
    expect(req.request.body.question).toBe('Is it missable?');
    req.flush(ready('No.'));
    await next;
    expect(convo.messages().map((m) => m.role)).toEqual(['assistant', 'user', 'assistant']);
  });

  it('asks for consent on a hidden achievement', async () => {
    const done = convo.start(false);
    http.expectOne((r) => r.url.endsWith('/guide')).flush({ ...ready(''), status: 'SPOILER_CONSENT_REQUIRED', text: null });
    await done;
    expect(convo.status()).toBe('consent');
  });

  it('explains the daily limit', async () => {
    const done = convo.start(false);
    http.expectOne((r) => r.url.endsWith('/guide')).flush({ error: 'assistant_quota_exceeded' }, { status: 429, statusText: 'x' });
    await done;
    expect(convo.error()).toContain('today’s guides');
  });
});
