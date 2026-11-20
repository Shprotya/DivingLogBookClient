import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'sites', pathMatch: 'full' },
    {
        path: 'sites',
        title: 'Dive sites',
        loadComponent: () => import('./features/sites/pages/site-list/site-list').then((m) => m.SiteList),
    },
    { path: '**', redirectTo: 'sites' },
];