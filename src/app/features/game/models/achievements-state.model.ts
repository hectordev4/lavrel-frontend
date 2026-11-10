import { GameAchievements } from './game-achievements.model';

export type AchievementsState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: GameAchievements }
  | { kind: 'error'; message: string };
