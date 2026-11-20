import { FormGroup } from '@angular/forms';
import { ApiError } from '../core/api-error';

// Puts each server message on the matching form control,
// e.g. { maxDepth: "deeper than the site" } shows under the depth input
export function applyServerErrors(form: FormGroup, error: ApiError): void {
    for (const [field, message] of Object.entries(error.fieldErrors)) {
        const control = form.get(field);
        control?.setErrors({ server: message });
        control?.markAsTouched();
    }
}