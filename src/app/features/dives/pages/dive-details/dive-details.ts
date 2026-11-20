import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiveService } from '../../services/dive.service';
import { Dive, siteId, siteName } from '../../models/dive.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';

@Component({
    selector: 'app-dive-details',
    imports: [RouterLink, DatePipe, MatButtonModule, MatProgressBarModule],
    templateUrl: './dive-details.html',
    styleUrl: './dive-details.scss',
})
export class DiveDetails {
    private diveService = inject(DiveService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    readonly id = input.required<string>();
    readonly siteName = siteName;
    readonly siteId = siteId;

    readonly deleting = signal(false);
    readonly deleteError = signal<string | null>(null);

    readonly state = toSignal(
        toObservable(this.id).pipe(switchMap((id) => withLoadState(this.diveService.getDive(id)))),
        { initialValue: { status: 'loading' } as LoadState<Dive> },
    );

    deleteDive(dive: Dive): void {
        if (!confirm('Delete this dive? This cannot be undone.')) return;

        this.deleting.set(true);
        this.deleteError.set(null);

        this.diveService.deleteDive(dive._id).subscribe({
            next: () => {
                this.snackBar.open('Dive deleted', 'Close', { duration: 5000 });
                this.router.navigate(['/dives']);
            },
            error: (err: Error) => {
                this.deleteError.set(err.message);
                this.deleting.set(false);
            },
        });
    }
}