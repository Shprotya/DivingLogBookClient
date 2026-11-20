import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from './api-error';

export function friendlyMessage(status: number): string {
    switch (status) {
        case 0:
            return 'Cannot reach the server. Check that the API is running.';
        case 400:
            return 'Some of the data was not valid.';
        case 404:
            return 'The item you asked for could not be found.';
        default:
            return 'Something went wrong on the server. Please try again later.';
    }
}

// Turns the API's error response into an ApiError.
// Validation errors come back as { errors: [{ path: ['maxDepth'], message: '...' }] },
// so each one is filed under its field name for the form to show.
function toApiError(error: HttpErrorResponse): ApiError {
    const body = error.error;
    const fieldErrors: Record<string, string> = {};

    if (Array.isArray(body?.errors)) {
        for (const issue of body.errors) {
            const field = issue.path?.[0];
            if (typeof field === 'string' && !fieldErrors[field]) {
                fieldErrors[field] = issue.message;
            }
        }
    }

    // A 409 or a 400 without field errors carries a useful message from the server
    // (e.g. "This site has dives logged at it"), so show that instead of a generic one
    const serverMessage = typeof body?.message === 'string' ? body.message : null;
    const useServerMessage =
        serverMessage && (error.status === 409 || (error.status === 400 && Object.keys(fieldErrors).length === 0));

    return new ApiError(useServerMessage ? serverMessage : friendlyMessage(error.status), error.status, fieldErrors);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
    next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.error(`HTTP ${error.status} ${req.method} ${req.url}`, error);
            return throwError(() => toApiError(error));
        }),
    );