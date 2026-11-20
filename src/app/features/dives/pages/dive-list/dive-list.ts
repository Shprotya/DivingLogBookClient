import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DiveService } from '../../services/dive.service';
import { SiteService } from '../../../sites/services/site.service';
import { Dive, DiveFilters, siteName } from '../../models/dive.model';
import { Site } from '../../../sites/models/site.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';

@Component({
    selector: 'app-dive-list',
    imports: [
        RouterLink,
        DatePipe,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressBarModule,
    ],
    templateUrl: './dive-list.html',
    styleUrl: './dive-list.scss',
})
export class DiveList {
    private diveService = inject(DiveService);
    private siteService = inject(SiteService);

    // So the template can call it
    readonly siteName = siteName;
    readonly ratings = [1, 2, 3, 4, 5];

    // Sites for the "Site" filter. If they fail to load, the dropdown is just empty.
    readonly sites = toSignal(
        this.siteService.getSites({ sort: 'name' }).pipe(catchError(() => of([] as Site[]))),
        { initialValue: [] as Site[] },
    );

    // Newest first by default, the same default as the API
    readonly filters = signal<DiveFilters>({ sort: '-date' });

    // The sighting search box
    readonly sightingSearch = new FormControl('', { nonNullable: true });

    readonly state = toSignal(
        toObservable(this.filters).pipe(switchMap((filters) => withLoadState(this.diveService.getDives(filters)))),
        { initialValue: { status: 'loading' } as LoadState<Dive[]> },
    );

    constructor() {
        // Wait until the user stops typing for 300 ms, so we don't send a request for every key.
        // takeUntilDestroyed stops listening when the user leaves the page.
        this.sightingSearch.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((text) => this.setFilter('sighting', text.trim()));
    }

    setFilter(key: keyof DiveFilters, value: string | number | undefined): void {
        this.filters.update((current) => ({ ...current, [key]: value === '' ? undefined : value }));
    }
}