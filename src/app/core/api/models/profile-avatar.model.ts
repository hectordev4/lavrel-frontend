/**
 * A member's picture (GET /api/currentuser/profile/avatar). GENERATED: drawn in the browser from the public
 * id; GALLERY: one of the gallery pictures, by galleryId; UPLOADED: their own picture, at url.
 */
export interface ProfileAvatar {
  kind: 'GENERATED' | 'GALLERY' | 'UPLOADED';
  galleryId: string | null;
  url: string | null;
}
