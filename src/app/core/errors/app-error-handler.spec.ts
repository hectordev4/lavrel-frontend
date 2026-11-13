import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppErrorHandler } from './app-error-handler';

describe('AppErrorHandler', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), AppErrorHandler] }));

  it('records the error with the address, and logs it once', () => {
    const handler = TestBed.inject(AppErrorHandler);
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    handler.handleError(new Error('boom'));
    handler.handleError(new Error('boom'));
    expect(handler.errors()).toEqual([{ message: 'boom', url: '/', at: expect.any(String) }]);
    expect(log).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });

  it('keeps only the latest 20', () => {
    const handler = TestBed.inject(AppErrorHandler);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (let i = 0; i < 25; i++) handler.handleError(`error ${i}`);
    expect(handler.errors().length).toBe(20);
    expect(handler.errors().at(-1)!.message).toBe('error 24');
  });
});
