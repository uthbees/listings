export interface FetchedVideo {
    videoId: string;
    publishedAt: Date;
    playlistPosition: number;
    videoTitle: string;
    channelTitle: string;
    thumbnail: string;
    requestSourceId: string;
    requestSourceType: 'playlist' | 'individual';
}

export interface UnwatchedVideo {
    id: string;
    playlistId: string;
    publishedAt: Date;
}
