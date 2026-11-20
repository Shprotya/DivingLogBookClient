import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SiteService } from '../../services/site.service';
import { DIFFICULTIES, SITE_TYPES, Site, SiteFilters } from '../../models/site.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';

@Component({
  imports: [
        RouterLink,
        TitleCasePipe,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressBarModule,
    ],
  selector: 'app-site-list',
  styleUrl: './site-list.scss',
  templateUrl: './site-list.html',
})

export class SiteList {
    private siteService = inject(SiteService);

    readonly siteTypes = SITE_TYPES;
    readonly difficulties = DIFFICULTIES;

    // The current filters. Changing this signal reloads the list.
    readonly filters = signal<SiteFilters>({ sort: 'name' });

    // Every time filters change, ask the API again. switchMap cancels the previous
    // request if a new filter is picked before the old one finishes.
    readonly state = toSignal(
        toObservable(this.filters).pipe(switchMap((filters) => withLoadState(this.siteService.getSites(filters)))),
        { initialValue: { status: 'loading' } as LoadState<Site[]> },
    );

    setFilter(key: keyof SiteFilters, value: string): void {
        // An empty value means "Any", so remove that filter
        this.filters.update((current) => ({ ...current, [key]: value || undefined }));
    }
}
