import { AbstractControl, ValidationErrors } from '@angular/forms';

// For <input type="date">, whose value is text like "2026-05-03".
// Dates in this format compare correctly as text, so no Date object is needed.
export function notInFuture(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // "required" handles empty
    const today = new Date().toISOString().slice(0, 10);
    return control.value > today ? { future: true } : null;
}