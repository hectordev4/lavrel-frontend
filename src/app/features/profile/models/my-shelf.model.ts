import { ShelfType } from '../../../core/profile/shelf-types';
import { PickedAchievement } from './picked-achievement.model';

/**
 * One of my shelves, as /api/currentuser/profile/shelves returns it. collectionId only for COLLECTION shelves;
 * achievementIds only for ACHIEVEMENTS shelves, in the order shown, with achievements giving each one in full.
 * title null: the type's own name.
 */
export interface MyShelf {
  id: string;
  type: ShelfType;
  title: string | null;
  position: number;
  collectionId: string | null;
  achievementIds: number[];
  achievements?: PickedAchievement[];
}
