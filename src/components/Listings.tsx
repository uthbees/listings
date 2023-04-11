import { PlaylistRequest } from '@/types';
import { useQueries } from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/components/createVideoList';
import fetchRecentVideos from '@/components/fetchRecentVideos';
import { startTransition, useReducer } from 'react';
import NoVideosMessage from '@/components/NoVideosMessage';

interface ListingsProps {
    playlistRequests: PlaylistRequest[];
}

// TODO: Add the ability to include individual videos
/*
Feature ideas:
  Try to make the page look better
  Add animation on video removal?
  Allow video restoration???
*/

export default function Listings({ playlistRequests }: ListingsProps) {
    // noinspection JSUnusedGlobalSymbols
    const requestPromises = useQueries({
        queries: playlistRequests.map((request) => ({
            queryKey: [request.id],
            queryFn: () => fetchRecentVideos(request),
            staleTime: Infinity,
            refetchOnWindowFocus: false,
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

    const videoList = createVideoList(requestPromises, doneVideoIDs);

    return (
        <div className="collectionContainer">
            {videoList.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    removeVideo={() =>
                        startTransition(() => {
                            dispatchDoneVideoIDs({
                                actionType: 'add',
                                newID: video.snippet.resourceId.videoId,
                            });
                        })
                    }
                />
            ))}
            {videoList.length === 0 ? (
                <NoVideosMessage
                    stillLoading={requestPromises.some(
                        (request) => request.status === 'loading',
                    )}
                />
            ) : null}
        </div>
    );
}

interface UDVActionAdd {
    actionType: 'add';
    newID: string;
}

type UDVAction = UDVActionAdd;
