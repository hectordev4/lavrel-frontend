import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { SectionState } from '../models/section-state.model';

/**
 * Loads one section's data with switchMap: each load() cancels the one still running, and a failure only
 * marks this section as failed. Create it in an injection context (a field of a section or store).
 */
export function sectionLoader<T>(request: () => Observable<T>) {
  const loads = new Subject<void>();
  const state = signal<SectionState<T>>({ kind: 'loading' });
  loads
    .pipe(
      switchMap(() =>
        request().pipe(
          map((data): SectionState<T> => ({ kind: 'ready', data })),
          catchError(() => of<SectionState<T>>({ kind: 'error' })),
          startWith<SectionState<T>>({ kind: 'loading' }),
        ),
      ),
      takeUntilDestroyed(inject(DestroyRef)),
    )
    .subscribe((s) => state.set(s));
  return { state: state.asReadonly(), load: () => loads.next() };
}
