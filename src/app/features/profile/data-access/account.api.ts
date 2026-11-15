import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { Country } from '../models/country.model';

/** The member's own account: display name, country, and deleting the account. */
@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  countries(): Observable<Country[]> {
    return this.http
      .get<{ countries: Country[] }>(`${this.base}/api/countries`)
      .pipe(map((r) => r.countries));
  }

  /** PATCH /api/currentuser/username. Names don't need to be unique: the public id tells players apart. */
  setUsername(username: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/api/currentuser/username`, { username });
  }

  /** null clears the country. */
  setCountry(countryId: number | null): Observable<void> {
    return this.http.patch<void>(`${this.base}/api/currentuser/country`, { countryId });
  }

  /** Deletes the account and everything in it. The backend asks for confirm=true. */
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/currentuser`, {
      params: new HttpParams().set('confirm', 'true'),
    });
  }
}
