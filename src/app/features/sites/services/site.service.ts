import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { toHttpParams } from '../../../shared/http-params';
import { Site, SiteFilters, SiteInput } from '../models/site.model';
import { Dive } from '../../dives/models/dive.model';

@Service()
export class SiteService {
    private http = inject(HttpClient);
    private url = `${API_URL}/sites`;

    getSites(filters: SiteFilters = {}): Observable<Site[]> {
        return this.http.get<Site[]>(this.url, { params: toHttpParams(filters) });
    }

    getSite(id: string): Observable<Site> {
        return this.http.get<Site>(`${this.url}/${id}`);
    }

    getSiteDives(id: string): Observable<Dive[]> {
        return this.http.get<Dive[]>(`${this.url}/${id}/dives`);
    }

    createSite(site: SiteInput): Observable<Site> {
        return this.http.post<Site>(this.url, site);
    }

    updateSite(id: string, site: SiteInput): Observable<Site> {
        return this.http.put<Site>(`${this.url}/${id}`, site);
    }

    deleteSite(id: string): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}