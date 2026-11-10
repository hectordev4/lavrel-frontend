import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { ProfileAvatar } from './models/profile-avatar.model';

/** The member's picture, under /api/currentuser/profile/avatar, and the public gallery ids. */
@Injectable({ providedIn: 'root' })
export class AvatarApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;
  private readonly url = `${this.base}/api/currentuser/profile/avatar`;

  get(): Observable<ProfileAvatar> {
    return this.http.get<ProfileAvatar>(this.url);
  }

  galleryIds(): Observable<string[]> {
    return this.http.get<{ galleryIds: string[] }>(`${this.base}/api/avatars/gallery`).pipe(map((r) => r.galleryIds));
  }

  chooseGallery(galleryId: string): Observable<ProfileAvatar> {
    return this.http.put<ProfileAvatar>(`${this.url}/gallery`, { galleryId });
  }

  /** The image file itself as the request body (JPG, PNG or GIF; animated GIFs are kept). */
  upload(file: File): Observable<ProfileAvatar> {
    return this.http.put<ProfileAvatar>(this.url, file, { headers: new HttpHeaders({ 'Content-Type': file.type }) });
  }

  /** Back to the generated avatar. */
  reset(): Observable<void> {
    return this.http.delete<void>(this.url);
  }
}
