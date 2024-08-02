export interface AppConfig {
    requests?: ConfigMediaRequests;
    options?: AppOptions;
}

export interface ConfigMediaRequests {
    playlists?: ConfigPlaylistRequest[];
    videos?: ConfigVideoRequest[];
}

export interface ConfigPlaylistRequest {
    id: string;
    retrieveAll?: boolean;
}

export interface ConfigVideoRequest {
    id: string;
}

export interface AppOptions {
    timedRefresh?: {
        enabled: boolean;
        refreshPeriod?: AppOptionsRefreshPeriod;
        refreshHour?: number;
    };
    invertSortDirection?: boolean;
}

export interface AppOptionsRefreshPeriod {
    interval?: 'weekly' | 'monthly';
    day?: number;
}
