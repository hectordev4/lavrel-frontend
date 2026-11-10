import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { AssistantApi } from './assistant.api';

describe('AssistantApi', () => {
  it('asks for a guide with the spoiler choice and language, and sends follow-ups', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    const api = TestBed.inject(AssistantApi);
    const http = TestBed.inject(HttpTestingController);
    api.guide(7, 42, false, 'en').subscribe();
    const get = http.expectOne((r) => r.url === '/api/games/7/achievements/42/guide');
    expect(get.request.params.get('spoilers')).toBe('false');
    expect(get.request.params.get('lang')).toBe('en');
    api.ask(7, 42, 'Is it missable?', true, 'en').subscribe();
    const post = http.expectOne('/api/games/7/achievements/42/guide/questions');
    expect(post.request.body).toEqual({ question: 'Is it missable?', spoilers: true, lang: 'en' });
  });
});
