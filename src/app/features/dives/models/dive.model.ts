import { Site } from '../../sites/models/site.model';

export interface Sighting {
    name: string;
    count: number;
}

// GET /dives fills in only the site's name and country
export type SiteSummary = Pick<Site, '_id' | 'name' | 'country'>;

export interface Dive {
    _id: string;
    date: string;
    // Just the id on /sites/:id/dives, name + country on /dives, the full site on /dives/:id
    site: string | SiteSummary | Site;
    maxDepth: number;
    duration: number;
    waterTemp?: number;
    visibility?: number;
    rating?: number;
    notes?: string;
    sightings: Sighting[];
    createdAt: string;
    updatedAt: string;
}

export interface DiveInput {
    date: string;
    site: string;
    maxDepth: number;
    duration: number;
    waterTemp?: number;
    visibility?: number;
    rating?: number;
    notes?: string;
    sightings: { name: string; count?: number }[];
}

export interface DiveFilters {
    site?: string;
    minDepth?: number;
    maxDepth?: number;
    from?: string;
    to?: string;
    sighting?: string;
    minRating?: number;
    sort?: string;
}

// The site's name, whichever shape the API sent (an id has no name)
export function siteName(site: Dive['site']): string {
    return typeof site === 'string' ? '' : site.name;
}

// The site's id, whichever shape the API sent
export function siteId(site: Dive['site']): string {
    return typeof site === 'string' ? site : site._id;
}