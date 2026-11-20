import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteService } from '../../services/site.service';
import { DIFFICULTIES, Difficulty, SITE_TYPES, SiteInput, SiteType } from '../../models/site.model';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { applyServerErrors } from '../../../../shared/form-errors';
import { ApiError } from '../../../../core/api-error';

@Component({
    selector: 'app-site-form',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        TitleCasePipe,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
    ],
    templateUrl: './site-form.html',
    styleUrl: './site-form.scss',
})
export class SiteForm implements OnInit {
    private fb = inject(FormBuilder);
    private siteService = inject(SiteService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    // Filled on /sites/:id/edit, undefined on /sites/new
    readonly id = input<string>();
    readonly isEdit = computed(() => !!this.id());

    readonly siteTypes = SITE_TYPES;
    readonly difficulties = DIFFICULTIES;

    readonly loadError = signal<string | null>(null);
    readonly saving = signal(false);
    readonly saveError = signal<string | null>(null);

    // The same rules as the Zod schema on the server
    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), notBlank]],
        country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), notBlank]],
        maxDepth: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(130)]),
        siteType: this.fb.control<SiteType | null>(null, Validators.required),
        difficulty: this.fb.control<Difficulty | null>(null, Validators.required),
    });

    ngOnInit(): void {
        const id = this.id();
        if (!id) return;

        // Edit mode: load the site and fill the form
        this.form.disable();
        this.siteService.getSite(id).subscribe({
            next: (site) => {
                this.form.patchValue(site);
                this.form.enable();
            },
            error: (err: Error) => this.loadError.set(err.message),
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            // Shows every error at once instead of the user discovering them one by one
            this.form.markAllAsTouched();
            return;
        }

        const { name, country, maxDepth, siteType, difficulty } = this.form.getRawValue();
        // The required validators guarantee these aren't null; the ! tells TypeScript so
        const site: SiteInput = { name, country, maxDepth: maxDepth!, siteType: siteType!, difficulty: difficulty! };
        const id = this.id();

        this.saving.set(true);
        this.saveError.set(null);
        this.form.disable();

        const request = id ? this.siteService.updateSite(id, site) : this.siteService.createSite(site);

        request.subscribe({
            next: (saved) => {
                this.snackBar.open(`${saved.name} ${id ? 'updated' : 'added'}`, 'Close', { duration: 5000 });
                this.router.navigate(['/sites', saved._id]);
            },
            error: (err: Error) => {
                this.saving.set(false);
                // Enable first: enabling re-runs validation, which would wipe the server errors
                this.form.enable();
                if (err instanceof ApiError) applyServerErrors(this.form, err);
                this.saveError.set(err.message);
            },
        });
    }
}