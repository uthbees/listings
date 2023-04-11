import { UseQueryResult } from '@tanstack/react-query';
import { YoutubePlaylistItem } from 'youtube.ts';

export default function createVideoList(
    requestPromises: UseQueryResult<YoutubePlaylistItem[]>[],
    doneVideoIDs: string[],
): YoutubePlaylistItem[] {
    return requestPromises
        .flatMap((playlistPromise) => {
            if (playlistPromise.status === 'error') {
                // eslint-disable-next-line no-console
                console.log('Request errored:', playlistPromise);
                alert('Request errored!');
                return [];
            }
            if (playlistPromise.status === 'loading') {
                return [];
            }
            return playlistPromise.data;
        })
        .filter(
            (video) => !doneVideoIDs.includes(video.snippet.resourceId.videoId),
        )
        .sort((a, b) => {
            const timeInMillisecondsA = Date.parse(a.snippet.publishedAt);
            const timeInMillisecondsB = Date.parse(b.snippet.publishedAt);

            // If two videos were published at exactly the same time, they're probably
            //		in a playlist together (because they were unprivated one at a time),
            //		so we look at the position within the playlist
            if (timeInMillisecondsA === timeInMillisecondsB)
                return b.snippet.position - a.snippet.position;
            else return timeInMillisecondsB - timeInMillisecondsA;
        });
}
