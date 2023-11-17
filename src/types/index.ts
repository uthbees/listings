export interface AppConfig {
    requests?: MediaRequests;
    options?: AppOptions;
}

export interface MediaRequests {
    playlists?: PlaylistRequest[];
    videos?: VideoRequest[];
}

export interface PlaylistRequest {
    id: string;
    retrieveAll?: boolean;
}

export interface VideoRequest {
    id: string;
}

export interface AppOptionsRefreshPeriod {
    interval?: 'weekly' | 'monthly';
    day?: number;
}

export interface AppOptions {
    timedRefresh?: {
        enabled: boolean;
        refreshPeriod?: AppOptionsRefreshPeriod;
        refreshHour?: number;
    };
    invertSortDirection?: boolean;
}

export interface NormalizedVideoData {
    videoID: string;
    publishedAt: string;
    playlistPosition: number;
    videoTitle: string;
    channelTitle: string;
    thumbnail: string;
}
