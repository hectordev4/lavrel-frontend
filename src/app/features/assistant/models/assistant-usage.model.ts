/**
 * New answers used today against the daily limit (saved guides don't count). Admins are unlimited:
 * unlimited true and dailyLimit null.
 */
export interface AssistantUsage {
  usedToday: number;
  dailyLimit: number | null;
  unlimited?: boolean;
}
