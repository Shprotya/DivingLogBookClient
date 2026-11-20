import { HttpParams } from '@angular/common/http';

// Builds ?key=value pairs, skipping filters that weren't set,
// the same idea as the filter object on the server
export function toHttpParams(filters: object): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            params = params.set(key, String(value));
        }
    }
    return params;
}