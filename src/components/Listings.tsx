import { AppConfig } from '@/types';
import { useQueries } from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/components/createVideoList';
import fetchPlaylistVideos from '@/components/fetchPlaylistVideos';
import { startTransition, useReducer } from 'react';
import NoVideosMessage from '@/components/NoVideosMessage';
import fetchIndividualVideo from '@/components/fetchIndividualVideo';

interface ListingsProps {
    appConfig: AppConfig;
}

/*
Feature ideas:
  Try to make the page look better
  Add animation on video removal?
  Allow video restoration???
*/

const reactQuerySettings = { staleTime: Infinity, refetchOnWindowFocus: false };

export default function Listings({ appConfig }: ListingsProps) {
    const { requests, options } = appConfig;

    const playlistRequestPromises = useQueries({
        queries: (requests?.playlists || []).map((request) => ({
            ...reactQuerySettings,
            queryKey: [request.id],
            queryFn: () => fetchPlaylistVideos(request),
        })),
    });

    const videoRequestPromises = useQueries({
        queries: (requests?.videos || []).map((request) => ({
            ...reactQuerySettings,
            queryKey: [request.id],
            queryFn: () => fetchIndividualVideo(request),
        })),
    });

    const [doneVideoIDs, dispatchDoneVideoIDs] = useReducer(
        updateDoneVideoIDs,
        (() => {
            const initialDoneVideoIDsString =
                localStorage.getItem('doneVideoIDs');
            return initialDoneVideoIDsString
                ? JSON.parse(initialDoneVideoIDsString)
                : [];
        })(),
    );

    function updateDoneVideoIDs(state: string[], action: UDVAction) {
        const nextState = [...state];

        switch (action.actionType) {
            case 'add':
                nextState.push(action.newID);
        }

        localStorage.setItem('doneVideoIDs', JSON.stringify(nextState));
        return nextState;
    }

    const videoList = createVideoList(
        playlistRequestPromises,
        videoRequestPromises,
        doneVideoIDs,
        options || {},
    );

    const stillLoading =
        playlistRequestPromises.some(
            (request) => request.status === 'loading',
        ) ||
        videoRequestPromises.some((request) => request.status === 'loading');

    return (
        <div className="collectionContainer">
            {videoList.map((video) => (
                <VideoCard
                    key={video.videoID}
                    video={video}
                    removeVideo={() =>
                        startTransition(() => {
                            dispatchDoneVideoIDs({
                                actionType: 'add',
                                newID: video.videoID,
                            });
                        })
                    }
                />
            ))}
            {videoList.length === 0 ? (
                <NoVideosMessage stillLoading={stillLoading} />
            ) : null}
        </div>
    );
}

interface UDVActionAdd {
    actionType: 'add';
    newID: string;
}

type UDVAction = UDVActionAdd;
