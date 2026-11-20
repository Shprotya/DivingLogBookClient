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
        { path: '', redirectTo: 'dives', pathMatch: 'full' },
    {
        path: 'dives',
        title: 'Dive log',
        loadComponent: () => import('./features/dives/pages/dive-list/dive-list').then((m) => m.DiveList),
    },
        {
        path: 'dives/new',
        title: 'Log a dive',
        loadComponent: () => import('./features/dives/pages/dive-form/dive-form').then((m) => m.DiveForm),
    },
    {
        path: 'dives/:id',
        title: 'Dive details',
        loadComponent: () => import('./features/dives/pages/dive-details/dive-details').then((m) => m.DiveDetails),
    },
    {
        path: 'dives/:id/edit',
        title: 'Edit dive',
        loadComponent: () => import('./features/dives/pages/dive-form/dive-form').then((m) => m.DiveForm),
    },
    { path: '**', redirectTo: 'dives' },
];