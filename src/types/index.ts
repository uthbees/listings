export interface MediaRequests {
    playlists: PlaylistRequest[];
    videos: VideoRequest[];
}

export interface PlaylistRequest {
    id: string;
    retrieveAll?: boolean;
}

export interface VideoRequest {
    id: string;
}

export interface NormalizedVideoData {
    videoID: string;
    publishedAt: string;
    playlistPosition: number;
    videoTitle: string;
    channelTitle: string;
    thumbnail: string;
}
