import { UseQueryResult } from '@tanstack/react-query';
import { YoutubePlaylistItem, YoutubeVideo } from 'youtube.ts';
import { AppOptions, NormalizedVideoData } from '@/types';
import { DEFAULT_THUMBNAIL_URL } from '@/utils/constants';
import getCutoff from '@/utils/getCutoff';

export default function createVideoList(
    playlistRequestPromises: UseQueryResult<YoutubePlaylistItem[]>[],
    videoRequestPromises: UseQueryResult<YoutubeVideo>[],
    doneVideoIDs: string[],
    options: AppOptions,
) {
    const latestCutoffMs = getCutoff(options, 'latest').getTime();

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

            let comparison;
            if (timeInMillisecondsA === timeInMillisecondsB) {
                // If two videos were published at exactly the same time, they're probably
                //		in a playlist together (because they were un-privated one at a time),
                //		so we look at the position within the playlist
                comparison = a.playlistPosition - b.playlistPosition;
            } else {
                comparison = timeInMillisecondsA - timeInMillisecondsB;
            }

            if (options.invertSortDirection === true) {
                comparison = -comparison;
            }

            return comparison;
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
                            publishedAt: video.contentDetails.videoPublishedAt,
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

interface CDAPlaylists {
    promises: UseQueryResult<YoutubePlaylistItem[]>[];
    type: 'playlists';
}

interface CDAVideos {
    promises: UseQueryResult<YoutubeVideo>[];
    type: 'videos';
}

type CDAArgs = CDAPlaylists | CDAVideos;
