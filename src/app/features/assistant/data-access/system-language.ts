/** The device's language as a two-letter code ("en", "de", "es"…), for the guide's lang=. English if unknown. */
export function systemLanguage(languages: readonly string[] = navigator.languages ?? [navigator.language]): string {
  const code = (languages[0] ?? '').slice(0, 2).toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : 'en';
}
