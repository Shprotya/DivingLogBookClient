export const SITE_TYPES = ['reef', 'wreck', 'wall', 'shore', 'cave'] as const;
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export type SiteType = (typeof SITE_TYPES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

// What the API sends back
export interface Site {
    _id: string;
    name: string;
    country: string;
    maxDepth: number;
    siteType: SiteType;
    difficulty: Difficulty;
    createdAt: string;
    updatedAt: string;
}

// What we send when creating or updating
export type SiteInput = Omit<Site, '_id' | 'createdAt' | 'updatedAt'>;

export interface SiteFilters {
    siteType?: SiteType;
    difficulty?: Difficulty;
    country?: string;
    sort?: string;
}