/**
 * Response of GET /api/currentuser. The first call creates the user on the backend.
 * publicId is the 16-digit player id others see; it may arrive as a number or a string.
 */
export interface CurrentUser {
  publicId?: string | number;
  username?: string;
  email?: string | null;
  emailVerified?: boolean;
  role?: 'USER' | 'SUPPORT' | 'ADMIN';
  countryId?: number | null;
}
