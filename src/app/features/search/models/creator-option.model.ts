import { CreatorRole } from './creator-role.model';

/** A franchise, developer or publisher; use id with the matching filter (franchise=, developer=, publisher=). */
export interface CreatorOption {
  id: number;
  name: string;
  role: CreatorRole;
  gameCount: number;
}
