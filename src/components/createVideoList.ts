import { UseQueryResult } from '@tanstack/react-query';
import { YoutubePlaylistItem, YoutubeVideo } from 'youtube.ts';
import { FetchedVideo, UnwatchedVideo } from '@/types';
import { DEFAULT_THUMBNAIL_URL } from '@/constants';
import getCutoff from '@/functions/getCutoff';
import { AppOptions } from '@/types/appConfig';
import mapObjToArray from '@/functions/objUtils/mapObjToArray';

// Expects objects for the RequestPromises arguments where the keys are the playlist/video ids.
export default function createVideoList(
    playlistRequestPromises: Record<
        string,
        UseQueryResult<YoutubePlaylistItem[]>
    >,
    videoRequestPromises: Record<string, UseQueryResult<YoutubeVideo>>,
    unwatchedVideos: UnwatchedVideo[],
    options: AppOptions,
) {
    const latestCutoffMs = getCutoff(options, 'latest').getTime();

    const unwatchedVideoIds = unwatchedVideos.map(
        (unwatchedVideo) => unwatchedVideo.id,
    );

    const allPlaylistVideos = createDataArrayFromPromises({
        promises: playlistRequestPromises,
        type: 'playlists',
    });

    const visiblePlaylistVideos: FetchedVideo[] = [];
    const donePlaylistVideos: FetchedVideo[] = [];

    for (const video of allPlaylistVideos) {
        if (unwatchedVideoIds.includes(video.videoId)) {
            if (video.publishedAt.getTime() < latestCutoffMs) {
                visiblePlaylistVideos.push(video);
            }
        } else {
            donePlaylistVideos.push(video);
        }
    }

    const allVisibleVideos = [
        ...visiblePlaylistVideos,
        ...createDataArrayFromPromises({
            promises: videoRequestPromises,
            type: 'videos',
        }),
    ];

    const sortedVisibleVideos = sortVideos(
        allVisibleVideos,
        options.invertSortDirection,
    );

    const sortedDoneVideos = sortVideos(donePlaylistVideos, true);

    return {
        visibleVideosList: sortedVisibleVideos,
        doneVideosList: sortedDoneVideos,
    };
}

function createDataArrayFromPromises({
    promises,
    type,
}: CDAArgs): FetchedVideo[] {
    return mapObjToArray(promises, (promise, requestId) => {
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
                        const formattedVideoData: FetchedVideo = {
                            videoId: video.id,
                            publishedAt: new Date(video.snippet.publishedAt),
                            playlistPosition: 0,
                            videoTitle: video.snippet.title,
                            channelTitle: video.snippet.channelTitle,
                            thumbnail:
                                video.snippet.thumbnails.medium?.url ||
                                DEFAULT_THUMBNAIL_URL,
                            requestSourceId: requestId,
                            requestSourceType: 'individual',
                        };
                        return formattedVideoData;
                    }
                    case 'playlists': {
                        const videos = promise.data as YoutubePlaylistItem[];
                        return videos.map(
                            (video): FetchedVideo => ({
                                videoId: video.snippet.resourceId.videoId,
                                publishedAt: new Date(
                                    video.contentDetails.videoPublishedAt,
                                ),
                                playlistPosition: video.snippet.position,
                                videoTitle: video.snippet.title,
                                channelTitle: video.snippet.channelTitle,
                                thumbnail:
                                    video.snippet.thumbnails.medium?.url ||
                                    DEFAULT_THUMBNAIL_URL,
                                requestSourceId: requestId,
                                requestSourceType: 'playlist',
                            }),
                        );
                    }
                }
        }
    }).flat();
}

function sortVideos(videos: FetchedVideo[], newestFirst?: boolean) {
    return videos.sort((a, b) => {
        const timestampA = a.publishedAt.getTime();
        const timestampB = b.publishedAt.getTime();

        let comparison;
        if (timestampA === timestampB) {
            // If two videos were published at exactly the same time, they're probably
            //		in a playlist together (because they were un-privated one at a time),
            //		so we look at the position within the playlist.
            comparison = a.playlistPosition - b.playlistPosition;
        } else {
            comparison = timestampA - timestampB;
        }

        if (newestFirst === true) {
            comparison = -comparison;
        }

        return comparison;
    });
}

interface CDAPlaylists {
    promises: Record<string, UseQueryResult<YoutubePlaylistItem[]>>;
    type: 'playlists';
}

interface CDAVideos {
    promises: Record<string, UseQueryResult<YoutubeVideo>>;
    type: 'videos';
}

type CDAArgs = CDAPlaylists | CDAVideos;
