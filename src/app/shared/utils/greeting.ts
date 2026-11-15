/** "Good morning," and so on, by the hour of the given time. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night,';
  if (hour < 12) return 'Good morning,';
  if (hour < 19) return 'Good afternoon,';
  return 'Good evening,';
}
