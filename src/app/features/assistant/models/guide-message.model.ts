import { GuideSource } from './guide-answer.model';

/** One bubble of a guide conversation. Kept only while the screen is open, never stored. */
export type GuideMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; html: string; grounded: boolean; curated: boolean; sources: GuideSource[] };
