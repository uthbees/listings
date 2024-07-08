import {
    AppConfig,
    AppOptions,
    DoneVideo,
    PlaylistRequest,
    VideoRequest,
} from '@/types';
import {
    QueryClient,
    QueryClientProvider,
    useQueries,
} from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/components/createVideoList';
import fetchPlaylistVideos from '@/components/fetchPlaylistVideos';
import { startTransition, useReducer, useState } from 'react';
import NoVideosMessage from '@/components/NoVideosMessage';
import fetchIndividualVideo from '@/components/fetchIndividualVideo';
import { Fab } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { RestoreFromTrash } from '@mui/icons-material';
import RestoreItemsModal from '@/components/RestoreItemsModal';

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
    const [restorationModalOpen, setRestorationModalOpen] = useState(false);

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

    const [doneVideos, dispatchDoneVideos] = useReducer(
        updateDoneVideos,
        (() => {
            const initialDoneVideosString =
                localStorage.getItem('doneVideos');

            const initialDoneVideos: DoneVideo[] = initialDoneVideosString
                ? JSON.parse(initialDoneVideosString)
                : [];
            return initialDoneVideos;
        })(),
    );

    function updateDoneVideos(state: DoneVideo[], action: UDVAction) {
        let nextState = [...state];

        switch (action.actionType) {
            case 'add':
                nextState.push({ ...action.newVideo });
                break;
            case 'remove':
                nextState = nextState.filter(
                    (doneVideo) => doneVideo.id !== action.removedID,
                );
                break;
            default:
                // eslint-disable-next-line no-console
                console.error('Action type not implemented.');
        }

        localStorage.setItem('doneVideos', JSON.stringify(nextState));
        return nextState;
    }

    const videoList = createVideoList(
        playlistRequestPromises,
        videoRequestPromises,
        doneVideos,
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
                            dispatchDoneVideos({
                                actionType: 'add',
                                newVideo: {
                                    id: video.videoID,
                                    title: video.videoTitle,
                                },
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
            <div
                style={{
                    position: 'fixed',
                    right: 30,
                    bottom: 30,
                    display: 'flex',
                    gap: 10,
                }}
            >
                {videoList.length !== 0 ? (
                    <Fab
                        color="primary"
                        title="Copy URL list to clipboard"
                        onClick={handleCopyButtonClick}
                    >
                        <ContentCopy />
                    </Fab>
                ) : null}
                <Fab
                    color="secondary"
                    title="Restore deleted items"
                    onClick={() => setRestorationModalOpen(true)}
                >
                    <RestoreFromTrash />
                </Fab>
            </div>
            <RestoreItemsModal
                open={restorationModalOpen}
                onClose={() => setRestorationModalOpen(false)}
                doneVideos={doneVideos}
                restoreVideo={(videoID) =>
                    dispatchDoneVideos({
                        actionType: 'remove',
                        removedID: videoID,
                    })
                }
            />
        </div>
    );
}

const queryClient = new QueryClient();

interface UDVActionAdd {
    actionType: 'add';
    newVideo: Required<DoneVideo>;
}
interface UDVActionRemove {
    actionType: 'remove';
    removedID: string;
}

type UDVAction = UDVActionAdd | UDVActionRemove;
