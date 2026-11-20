import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'sites', pathMatch: 'full' },
    {
        path: 'sites',
        title: 'Dive sites',
        loadComponent: () => import('./features/sites/pages/site-list/site-list').then((m) => m.SiteList),
    },
    {
        path: 'sites/new',
        title: 'Add a site',
        loadComponent: () => import('./features/sites/pages/site-form/site-form').then((m) => m.SiteForm),
    },
    {
        path: 'sites/:id',
        title: 'Site details',
        loadComponent: () => import('./features/sites/pages/site-details/site-details').then((m) => m.SiteDetails),
    },
    {
        path: 'sites/:id/edit',
        title: 'Edit site',
        loadComponent: () => import('./features/sites/pages/site-form/site-form').then((m) => m.SiteForm),
    },
    { path: '**', redirectTo: 'sites' },
];