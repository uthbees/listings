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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppOptions {}

export interface NormalizedVideoData {
    videoID: string;
    publishedAt: string;
    playlistPosition: number;
    videoTitle: string;
    channelTitle: string;
    thumbnail: string;
}
