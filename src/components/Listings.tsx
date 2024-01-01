import { AppConfig, AppOptions, PlaylistRequest, VideoRequest } from '@/types';
import {
    QueryClient,
    QueryClientProvider,
    useQueries,
} from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/components/createVideoList';
import fetchPlaylistVideos from '@/components/fetchPlaylistVideos';
import { startTransition, useReducer } from 'react';
import NoVideosMessage from '@/components/NoVideosMessage';
import fetchIndividualVideo from '@/components/fetchIndividualVideo';
import { Fab } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';

interface ListingsProps {
    appConfig: AppConfig;
}

const reactQuerySettings = { staleTime: Infinity, refetchOnWindowFocus: false };

export default function Listings({ appConfig }: ListingsProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ListingsInternal appConfig={appConfig} />
        </QueryClientProvider>
    );
}

function ListingsInternal({ appConfig }: ListingsProps) {
    const requestedPlaylists: PlaylistRequest[] =
        appConfig.requests?.playlists || [];
    const requestedVideos: VideoRequest[] = appConfig.requests?.videos || [];
    const appOptions: AppOptions = appConfig.options || {};

    const playlistRequestPromises = useQueries({
        queries: requestedPlaylists.map((request) => ({
            ...reactQuerySettings,
            queryKey: [request.id],
            queryFn: () => fetchPlaylistVideos(request),
        })),
    });

    const videoRequestPromises = useQueries({
        queries: requestedVideos.map((request) => ({
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
        appOptions,
    );

    const stillLoading =
        playlistRequestPromises.some(
            (request) => request.status === 'loading',
        ) ||
        videoRequestPromises.some((request) => request.status === 'loading');

    function handleCopyButtonClick() {
        navigator.clipboard.writeText(
            videoList
                .map((video) => `https://youtube.com/watch?v=${video.videoID}`)
                .join(' '),
        );
    }

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
                <NoVideosMessage
                    stillLoading={stillLoading}
                    options={appOptions}
                />
            ) : null}
            {videoList.length !== 0 ? (
                <div style={{ position: 'fixed', right: 30, bottom: 30 }}>
                    <Fab
                        color="primary"
                        title="Copy URL list to clipboard"
                        onClick={handleCopyButtonClick}
                    >
                        <ContentCopy />
                    </Fab>
                </div>
            ) : null}
        </div>
    );
}

const queryClient = new QueryClient();

interface UDVActionAdd {
    actionType: 'add';
    newID: string;
}

type UDVAction = UDVActionAdd;
