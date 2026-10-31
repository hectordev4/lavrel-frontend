/** The auth action currently running; only one runs at a time. */
export type AuthTask = 'google' | 'email' | 'register' | 'reset' | 'resend' | 'check' | 'sign-out';
