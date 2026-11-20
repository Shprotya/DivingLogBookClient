import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { forkJoin, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteService } from '../../services/site.service';
import { Site } from '../../models/site.model';
import { Dive } from '../../../dives/models/dive.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';

interface SiteWithDives {
    site: Site;
    dives: Dive[];
}

@Component({
    selector: 'app-site-details',
    imports: [RouterLink, DatePipe, TitleCasePipe, MatButtonModule, MatProgressBarModule],
    templateUrl: './site-details.html',
    styleUrl: './site-details.scss',
})
export class SiteDetails {
    private siteService = inject(SiteService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    // Filled from the :id in the URL
    readonly id = input.required<string>();

    readonly deleting = signal(false);
    readonly deleteError = signal<string | null>(null);

    // Loads the site and its dives at the same time.
    // forkJoin waits for both requests and gives back { site, dives }
    readonly state = toSignal(
        toObservable(this.id).pipe(
            switchMap((id) =>
                withLoadState(
                    forkJoin({
                        site: this.siteService.getSite(id),
                        dives: this.siteService.getSiteDives(id),
                    }),
                ),
            ),
        ),
        { initialValue: { status: 'loading' } as LoadState<SiteWithDives> },
    );

    deleteSite(site: Site): void {
        if (!confirm(`Delete ${site.name}? This cannot be undone.`)) return;

        this.deleting.set(true);
        this.deleteError.set(null);

        this.siteService.deleteSite(site._id).subscribe({
            next: () => {
                this.snackBar.open(`${site.name} deleted`, 'Close', { duration: 5000 });
                this.router.navigate(['/sites']);
            },
            // A site with dives comes back as 409, and the interceptor keeps the server's message
            error: (err: Error) => {
                this.deleteError.set(err.message);
                this.deleting.set(false);
            },
        });
    }
}