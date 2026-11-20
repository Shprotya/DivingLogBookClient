import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiveService } from '../../services/dive.service';
import { SiteService } from '../../../sites/services/site.service';
import { DiveInput, siteId } from '../../models/dive.model';
import { Site } from '../../../sites/models/site.model';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { notInFuture } from '../../../../shared/validators/not-in-future.validator';
import { applyServerErrors } from '../../../../shared/form-errors';
import { ApiError } from '../../../../core/api-error';

// One row in the sightings list
type SightingGroup = FormGroup<{ name: FormControl<string>; count: FormControl<number> }>;

@Component({
    selector: 'app-dive-form',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
    ],
    templateUrl: './dive-form.html',
    styleUrl: './dive-form.scss',
})
export class DiveForm implements OnInit {
    private fb = inject(FormBuilder);
    private diveService = inject(DiveService);
    private siteService = inject(SiteService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    // Filled on /dives/:id/edit, undefined on /dives/new
    readonly id = input<string>();
    readonly isEdit = computed(() => !!this.id());

    readonly ratings = [1, 2, 3, 4, 5];
    // Used as the date picker's max, so future days can't be picked
    readonly today = new Date().toISOString().slice(0, 10);

    // Sites for the dropdown
    readonly sites = toSignal(
        this.siteService.getSites({ sort: 'name' }).pipe(catchError(() => of([] as Site[]))),
        { initialValue: [] as Site[] },
    );

    readonly loadError = signal<string | null>(null);
    readonly saving = signal(false);
    readonly saveError = signal<string | null>(null);

    // Cross-field check: the dive can't be deeper than the site chosen in the same form.
    // control.parent is the whole form, so it can read the "site" field.
    private withinSiteDepth: ValidatorFn = (control) => {
        const id = control.parent?.get('site')?.value;
        const site = this.sites().find((s) => s._id === id);
        if (!site || control.value == null) return null;
        return control.value > site.maxDepth ? { tooDeep: { max: site.maxDepth } } : null;
    };

    // The same rules as the Zod schema on the server
    readonly form = this.fb.group({
        date: this.fb.nonNullable.control('', [Validators.required, notInFuture]),
        site: this.fb.nonNullable.control('', Validators.required),
        maxDepth: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(130),
            this.withinSiteDepth,
        ]),
        duration: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(1),
            Validators.max(300),
            Validators.pattern(/^\d+$/), // whole minutes only
        ]),
        waterTemp: this.fb.control<number | null>(null, [Validators.min(-2), Validators.max(35)]),
        visibility: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(60)]),
        rating: this.fb.control<number | null>(null),
        notes: this.fb.nonNullable.control('', Validators.maxLength(1000)),
        // A list of rows that grows and shrinks: one group per animal seen
        sightings: this.fb.array<SightingGroup>([]),
    });

    get sightings() {
        return this.form.controls.sightings;
    }

    constructor() {
        // Changing the site changes the allowed depth, so re-check the depth field
        this.form.controls.site.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.form.controls.maxDepth.updateValueAndValidity());

        // The sites arrive from the API after the form is built, so re-check once they're here
        effect(() => {
            this.sites();
            this.form.controls.maxDepth.updateValueAndValidity();
        });
    }

    // The site picked in the dropdown, for the depth hint
    selectedSite(): Site | undefined {
        return this.sites().find((s) => s._id === this.form.controls.site.value);
    }

    newSighting(name = '', count = 1): SightingGroup {
        return this.fb.nonNullable.group({
            name: [name, [Validators.required, Validators.maxLength(60), notBlank]],
            count: [count, [Validators.required, Validators.min(1), Validators.max(10000)]],
        });
    }

    addSighting(): void {
        this.sightings.push(this.newSighting());
    }

    removeSighting(index: number): void {
        this.sightings.removeAt(index);
    }

    ngOnInit(): void {
        const id = this.id();
        if (!id) return;

        // Edit mode: load the dive and fill the form
        this.form.disable();
        this.diveService.getDive(id).subscribe({
            next: (dive) => {
                this.form.patchValue({
                    date: dive.date.slice(0, 10), // "2026-05-03T10:30:00.000Z" -> "2026-05-03"
                    site: siteId(dive.site),
                    maxDepth: dive.maxDepth,
                    duration: dive.duration,
                    waterTemp: dive.waterTemp ?? null,
                    visibility: dive.visibility ?? null,
                    rating: dive.rating ?? null,
                    notes: dive.notes ?? '',
                });
                // patchValue can't add rows, so build one row per sighting
                this.sightings.clear();
                for (const s of dive.sightings) {
                    this.sightings.push(this.newSighting(s.name, s.count));
                }
                this.form.enable();
            },
            error: (err: Error) => this.loadError.set(err.message),
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const v = this.form.getRawValue();
        // Empty optional fields become undefined, so they're left out of the JSON
        const dive: DiveInput = {
            date: v.date,
            site: v.site,
            maxDepth: v.maxDepth!,
            duration: v.duration!,
            waterTemp: v.waterTemp ?? undefined,
            visibility: v.visibility ?? undefined,
            rating: v.rating ?? undefined,
            notes: v.notes.trim() || undefined,
            sightings: v.sightings,
        };
        const id = this.id();

        this.saving.set(true);
        this.saveError.set(null);
        this.form.disable();

        const request = id ? this.diveService.updateDive(id, dive) : this.diveService.createDive(dive);

        request.subscribe({
            next: (saved) => {
                this.snackBar.open(`Dive ${id ? 'updated' : 'logged'}`, 'Close', { duration: 5000 });
                this.router.navigate(['/dives', saved._id]);
            },
            error: (err: Error) => {
                this.saving.set(false);
                this.form.enable();
                if (err instanceof ApiError) applyServerErrors(this.form, err);
                this.saveError.set(err.message);
            },
        });
    }
}