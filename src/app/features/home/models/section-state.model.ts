/** One Home section's data: loading, loaded, or failed (the section then offers Try again). */
export type SectionState<T> = { kind: 'loading' } | { kind: 'ready'; data: T } | { kind: 'error' };
