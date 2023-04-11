import { PlaylistRequest } from '@/types';
import { useQueries } from '@tanstack/react-query';
import { APIKey } from '@/config/APIKey';
import Youtube from 'youtube.ts';

const RETRIEVED_PER_PLAYLIST = 20;

interface ListingsProps {
    playlistRequests: PlaylistRequest[];
}

// TODO: Finish converting to React
// TODO: Add the ability to include individual videos
/*
Feature ideas:
  Try to make the page look better
  Add animation on video removal?
  Allow video restoration???
*/

export default function Listings({ playlistRequests }: ListingsProps) {
    // noinspection JSUnusedGlobalSymbols
    const data = useQueries({
        queries: playlistRequests.map((request) => ({
            queryKey: [request.id],
            queryFn: () => fetchRecentVideos(request),
            staleTime: Infinity,
            refetchOnWindowFocus: false,
        })),
    });

    console.log(data);

    return <div>test</div>;
}

async function fetchRecentVideos(listRequest: PlaylistRequest) {
    const shouldRetrieveAll =
        listRequest.id.substring(0, 2) === 'PL' || listRequest.retrieveAll;
    const retrievalCount = shouldRetrieveAll ? 50 : RETRIEVED_PER_PLAYLIST;

    const youtube = new Youtube(APIKey);

    async function executeFetch(pageToken?: string) {
        const data = await youtube.playlists.items(listRequest.id, {
            part: 'snippet',
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
