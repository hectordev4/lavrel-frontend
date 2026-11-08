/**
 * A member's picture (GET /api/currentuser/profile/avatar). GENERATED: drawn in the browser from the public
 * id; GALLERY: one of the gallery pictures, by galleryId; UPLOADED: their own picture, at imageUrl (public
 * Supabase Storage address). Every avatar endpoint answers with this shape.
 */
export interface ProfileAvatar {
  kind: 'GENERATED' | 'GALLERY' | 'UPLOADED';
  galleryId: string | null;
  imageUrl: string | null;
}
