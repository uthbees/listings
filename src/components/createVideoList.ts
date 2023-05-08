import { UseQueryResult } from '@tanstack/react-query';
import { YoutubePlaylistItem, YoutubeVideo } from 'youtube.ts';
import { AppOptions, NormalizedVideoData } from '@/types';
import {
    DEFAULT_THUMBNAIL_URL,
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';

export default function createVideoList(
    playlistRequestPromises: UseQueryResult<YoutubePlaylistItem[]>[],
    videoRequestPromises: UseQueryResult<YoutubeVideo>[],
    doneVideoIDs: string[],
    options: AppOptions,
) {
    const latestCutoffMs = getLatestCutoffMs(options);
    console.log(latestCutoffMs);
    return [
        ...createDataArrayFromPromises({
            promises: playlistRequestPromises,
            type: 'playlists',
        }),
        ...createDataArrayFromPromises({
            promises: videoRequestPromises,
            type: 'videos',
        }),
    ]
        .filter(
            (video) =>
                !doneVideoIDs.includes(video.videoID) &&
                Date.parse(video.publishedAt) < latestCutoffMs,
        )
        .sort((a, b) => {
            const timeInMillisecondsA = Date.parse(a.publishedAt);
            const timeInMillisecondsB = Date.parse(b.publishedAt);

            // If two videos were published at exactly the same time, they're probably
            //		in a playlist together (because they were unprivated one at a time),
            //		so we look at the position within the playlist
            if (timeInMillisecondsA === timeInMillisecondsB)
                return a.playlistPosition - b.playlistPosition;
            else return timeInMillisecondsA - timeInMillisecondsB;
        });
}
function createDataArrayFromPromises({
    promises,
    type,
}: CDAArgs): NormalizedVideoData[] {
    return promises.flatMap((promise) => {
        switch (promise.status) {
            case 'error':
                // eslint-disable-next-line no-console
                console.log('Request errored:', promise);
                alert('Request errored!');
                return [];
            case 'loading':
                return [];
            case 'success':
                switch (type) {
                    case 'videos': {
                        const video = promise.data as YoutubeVideo;
                        return {
                            videoID: video.id,
                            publishedAt: video.snippet.publishedAt,
                            playlistPosition: 0,
                            videoTitle: video.snippet.title,
                            channelTitle: video.snippet.channelTitle,
                            thumbnail:
                                video.snippet.thumbnails.medium?.url ||
                                DEFAULT_THUMBNAIL_URL,
                        };
                    }
                    case 'playlists': {
                        const videos = promise.data as YoutubePlaylistItem[];
                        return videos.map((video) => ({
                            videoID: video.snippet.resourceId.videoId,
                            publishedAt: video.snippet.publishedAt,
                            playlistPosition: video.snippet.position,
                            videoTitle: video.snippet.title,
                            channelTitle: video.snippet.channelTitle,
                            thumbnail:
                                video.snippet.thumbnails.medium?.url ||
                                DEFAULT_THUMBNAIL_URL,
                        }));
                    }
                }
        }
    });
}

function getLatestCutoffMs(options: AppOptions): number {
    if (!options.useWeeklyRefresh) {
        return Date.now();
    }

    const refreshDay =
        typeof options.weeklyRefreshDay === 'number' &&
        options.weeklyRefreshDay >= 0 &&
        options.weeklyRefreshDay <= 6
            ? options.weeklyRefreshDay
            : DEFAULT_WEEKLY_REFRESH_DAY;

    const refreshHour =
        typeof options.weeklyRefreshHour === 'number' &&
        options.weeklyRefreshHour >= 0 &&
        options.weeklyRefreshHour <= 23
            ? options.weeklyRefreshHour
            : DEFAULT_WEEKLY_REFRESH_HOUR;

    const latestCutoffDate = new Date();
    latestCutoffDate.setHours(refreshHour, 0, 0, 0);

    const dayDistance = refreshDay - latestCutoffDate.getDay();

    latestCutoffDate.setDate(latestCutoffDate.getDay() + dayDistance);

    return latestCutoffDate.getTime();
}

interface CDAPlaylists {
    promises: UseQueryResult<YoutubePlaylistItem[]>[];
    type: 'playlists';
}

interface CDAVideos {
    promises: UseQueryResult<YoutubeVideo>[];
    type: 'videos';
}

type CDAArgs = CDAPlaylists | CDAVideos;
