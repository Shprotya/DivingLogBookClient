import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { toHttpParams } from '../../../shared/http-params';
import { Dive, DiveFilters, DiveInput } from '../models/dive.model';

@Service()
export class DiveService {
    private http = inject(HttpClient);
    private url = `${API_URL}/dives`;

    getDives(filters: DiveFilters = {}): Observable<Dive[]> {
        return this.http.get<Dive[]>(this.url, { params: toHttpParams(filters) });
    }

    getDive(id: string): Observable<Dive> {
        return this.http.get<Dive>(`${this.url}/${id}`);
    }

    createDive(dive: DiveInput): Observable<Dive> {
        return this.http.post<Dive>(this.url, dive);
    }

    updateDive(id: string, dive: DiveInput): Observable<Dive> {
        return this.http.put<Dive>(`${this.url}/${id}`, dive);
    }

    deleteDive(id: string): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}