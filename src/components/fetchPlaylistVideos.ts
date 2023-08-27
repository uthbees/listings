import { PlaylistRequest } from '@/types';
import Youtube from 'youtube.ts';
import { APIKey } from '@/config/APIKey';
import { RETRIEVED_PER_PLAYLIST } from '@/utils/constants';

export default async function fetchPlaylistVideos(request: PlaylistRequest) {
    const shouldRetrieveAll =
        request.id.substring(0, 2) === 'PL' || request.retrieveAll;
    const retrievalCount = shouldRetrieveAll ? 50 : RETRIEVED_PER_PLAYLIST;

    const youtube = new Youtube(APIKey);

    async function executeFetch(pageToken?: string) {
        const data = await youtube.playlists.items(request.id, {
            part: 'snippet, contentDetails',
            maxResults: retrievalCount.toString(),
            pageToken: pageToken,
        });

        const fetchedVideos = data.items;

        if (shouldRetrieveAll && data.nextPageToken) {
            const otherPages = await executeFetch(data.nextPageToken);
            fetchedVideos.push(...otherPages);
        }
        return fetchedVideos;
    }

    return executeFetch();
}
