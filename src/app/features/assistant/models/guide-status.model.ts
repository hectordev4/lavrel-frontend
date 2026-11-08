/**
 * choosing: waiting for the spoiler choice; consent: a hidden achievement asked without spoilers;
 * answering: a request is out; ready: the person can ask more; failed: the last request failed.
 */
export type GuideStatus = 'choosing' | 'answering' | 'ready' | 'consent' | 'failed';
