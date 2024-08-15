import Youtube, { YoutubePlaylistItem } from 'youtube.ts';
import { APIKey } from '@/config/APIKey';
import { UnwatchedVideo } from '@/types';

export interface FetchPlaylistParameters {
    playlistId: string;
    targetVideos: { id: string; publishedAt: Date }[];
    retrieveAll?: boolean;
    markVideosAsDone: (videoIds: string[]) => void;
    markVideosAsUnwatched: (videos: UnwatchedVideo[]) => void;
}

export default async function fetchPlaylistVideos(
    params: FetchPlaylistParameters,
) {
    const shouldRetrieveAll = params.retrieveAll ?? false;
    const youtube = new Youtube(APIKey);
    const localStorageLastCheckedKey = `lastCheckedPL_${params.playlistId}`;
    // Get the timestamp before we start fetching, just to be extra careful in case a new video is published while
    // we're querying.
    const preFetchingTimestamp = Date.now();

    const rawLastCheckedPlaylistTimestamp = localStorage.getItem(
        localStorageLastCheckedKey,
    );
    let lastCheckedPlaylistTimestamp: number;

    if (rawLastCheckedPlaylistTimestamp !== null) {
        lastCheckedPlaylistTimestamp = parseInt(
            rawLastCheckedPlaylistTimestamp,
            10,
        );
    } else {
        // For new channels, show all the videos if retrieveAll is true and show none of them up to the current moment otherwise.
        lastCheckedPlaylistTimestamp = shouldRetrieveAll
            ? 0
            : preFetchingTimestamp;
    }

    const fetchedVideos: YoutubePlaylistItem[] = [];
    await executeFetch();
    return fetchedVideos;

    async function executeFetch(pageToken?: string) {
        const data = await youtube.playlists.items(params.playlistId, {
            part: 'snippet, contentDetails',
            maxResults: '50',
            pageToken: pageToken,
        });

        fetchedVideos.push(...data.items);

        // Find all the target videos for which there is no fetched video with a matching id.
        const missingTargetVideos = params.targetVideos.filter(
            (targetVideo) =>
                !fetchedVideos.some(
                    (fetchedVideo) =>
                        fetchedVideo.contentDetails.videoId === targetVideo.id,
                ),
        );

        const oldestFetchedVideoPublicationTimestamp = Date.parse(
            fetchedVideos[fetchedVideos.length - 1].contentDetails
                .videoPublishedAt,
        );
        const reachedAllTargetVideoTimestamps = !missingTargetVideos.some(
            (missingVideo) =>
                missingVideo.publishedAt.getTime() <
                oldestFetchedVideoPublicationTimestamp,
        );
        const reachedLastCheckedTimestamp =
            oldestFetchedVideoPublicationTimestamp <
            lastCheckedPlaylistTimestamp;

        if (
            data.nextPageToken &&
            (shouldRetrieveAll ||
                !reachedAllTargetVideoTimestamps ||
                !reachedLastCheckedTimestamp)
        ) {
            await executeFetch(data.nextPageToken);
        } else {
            if (missingTargetVideos.length > 0) {
                warnAboutMissingTargetVideos(
                    params.playlistId,
                    missingTargetVideos.map((missingVideo) => missingVideo.id),
                    params.markVideosAsDone,
                );
            }

            params.markVideosAsUnwatched(
                fetchedVideos
                    .filter(
                        (video) =>
                            Date.parse(video.contentDetails.videoPublishedAt) >
                            lastCheckedPlaylistTimestamp,
                    )
                    .map((video) => ({
                        id: video.contentDetails.videoId,
                        playlistId: params.playlistId,
                        publishedAt: new Date(
                            video.contentDetails.videoPublishedAt,
                        ),
                    })),
            );

            localStorage.setItem(
                localStorageLastCheckedKey,
                preFetchingTimestamp.toString(),
            );
        }
    }
}

function warnAboutMissingTargetVideos(
    playlistId: string,
    missingTargetVideoIds: string[],
    markVideosAsDone: (videoIds: string[]) => void,
) {
    let alertMessage: string;
    if (missingTargetVideoIds.length === 1) {
        alertMessage = `Failed to find video with id ${missingTargetVideoIds[0]} in playlist with id ${playlistId}.`;
    } else {
        alertMessage = `Failed to find ${missingTargetVideoIds.length} videos in playlist with id ${playlistId}. See console for video ids.`;
    }

    warnAboutMissingVideos(
        `Failed to find ${missingTargetVideoIds.length} videos in playlist with id ${playlistId}.`,
        alertMessage,
        missingTargetVideoIds,
        markVideosAsDone,
    );
}

export function warnAboutMissingVideos(
    consoleMessage: string,
    alertMessage: string,
    missingTargetVideoIds: string[],
    markVideosAsDone: (videoIds: string[]) => void,
) {
    // eslint-disable-next-line no-console
    console.warn(`${consoleMessage} Ids:`, missingTargetVideoIds);

    const removeMissingVideos = confirm(
        `${alertMessage}\n\nRemove missing videos from unwatched videos list?`,
    );
    if (removeMissingVideos) {
        markVideosAsDone(missingTargetVideoIds);
    }
}
