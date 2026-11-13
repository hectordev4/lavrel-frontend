import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { sectionLoader } from './section-loader';

describe('sectionLoader', () => {
  it('shows the newest answer only, and a failure as an error state', () => {
    const answers: Subject<number>[] = [];
    @Component({ template: '' })
    class Host {
      readonly loader = sectionLoader(() => {
        const s = new Subject<number>();
        answers.push(s);
        return s;
      });
      readonly failing = sectionLoader(() => throwError(() => new Error('down')));
    }
    const host = TestBed.createComponent(Host).componentInstance;
    host.loader.load();
    host.loader.load();
    answers[0].next(1);
    expect(host.loader.state().kind).toBe('loading');
    answers[1].next(2);
    expect(host.loader.state()).toEqual({ kind: 'ready', data: 2 });
    host.failing.load();
    expect(host.failing.state().kind).toBe('error');
  });
});
