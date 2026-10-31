/**
 * Response of GET /api/currentuser.
 * Fields are optional until the backend's DTO pass settles the response shape.
 */
export interface CurrentUser {
  publicId?: string | number;
  username?: string;
  emailVerified?: boolean;
  role?: 'USER' | 'SUPPORT' | 'ADMIN';
  countryId?: number | null;
}
