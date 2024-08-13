import { UnwatchedVideo } from '@/types';
import {
    QueryClient,
    QueryClientProvider,
    useQueries,
} from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/functions/createVideoList';
import fetchPlaylistVideos from '@/functions/fetchPlaylistVideos';
import { startTransition, useReducer, useState } from 'react';
import NoVideosMessage from '@/components/NoVideosMessage';
import fetchIndividualVideo from '@/functions/fetchIndividualVideo';
import { Fab, Typography } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { RestoreFromTrash } from '@mui/icons-material';
import RestoreItemsModal from '@/components/RestoreItemsModal';
import {
    AppConfig,
    AppOptions,
    ConfigPlaylistRequest,
    ConfigVideoRequest,
} from '@/types/appConfig';
import mapArrayToObj from '@/functions/objUtils/mapArrayToObj';

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

    const [unwatchedVideos, dispatchUnwatchedVideos] = useReducer(
        updateUnwatchedVideos,
        undefined,
        () => {
            const rawUnwatchedVideosString =
                localStorage.getItem('unwatchedVideos');

            const rawUnwatchedVideos: (Omit<UnwatchedVideo, 'publishedAt'> & {
                publishedAt: string;
            })[] = rawUnwatchedVideosString
                ? JSON.parse(rawUnwatchedVideosString)
                : [];

            return rawUnwatchedVideos.map((rawUnwatchedVideo) => ({
                ...rawUnwatchedVideo,
                publishedAt: new Date(rawUnwatchedVideo.publishedAt),
            }));
        },
    );

    function updateUnwatchedVideos(state: UnwatchedVideo[], action: UUVAction) {
        let nextState = [...state];

        switch (action.actionType) {
            case 'add': {
                const newVideos = Array.isArray(action.newVideos)
                    ? action.newVideos
                    : [action.newVideos];

                nextState.push(...structuredClone(newVideos));
                break;
            }
            case 'remove': {
                const removedIds = Array.isArray(action.removedIds)
                    ? action.removedIds
                    : [action.removedIds];

                removedIds.forEach((removedId) => {
                    nextState = nextState.filter(
                        (unwatchedVideo) => unwatchedVideo.id !== removedId,
                    );
                });
                break;
            }
            default:
                // eslint-disable-next-line no-console
                console.error('Action type not implemented.');
        }

        localStorage.setItem('unwatchedVideos', JSON.stringify(nextState));
        return nextState;
    }

    const requestedPlaylists: ConfigPlaylistRequest[] =
        appConfig.requests?.playlists || [];
    const requestedVideos: ConfigVideoRequest[] =
        appConfig.requests?.videos || [];
    const appOptions: AppOptions = appConfig.options || {};

    const playlistRequestPromises = useQueries({
        queries: requestedPlaylists.map((request) => ({
            ...reactQuerySettings,
            queryKey: [request.id],
            queryFn: () =>
                fetchPlaylistVideos({
                    playlistId: request.id,
                    targetVideos: unwatchedVideos.filter(
                        (video) => video.playlistId === request.id,
                    ),
                    retrieveAll: request.retrieveAll,
                    markVideosAsDone: (videoIds) =>
                        dispatchUnwatchedVideos({
                            actionType: 'remove',
                            removedIds: videoIds,
                        }),
                    markVideosAsUnwatched: (videos) =>
                        dispatchUnwatchedVideos({
                            actionType: 'add',
                            newVideos: videos,
                        }),
                }),
        })),
    });

    const videoRequestPromises = useQueries({
        queries: requestedVideos.map((request) => ({
            ...reactQuerySettings,
            queryKey: [request.id],
            queryFn: () => fetchIndividualVideo(request),
        })),
    });

    const { visibleVideosList, doneVideosList } = createVideoList(
        mapArrayToObj(playlistRequestPromises, (promise, index) => [
            requestedPlaylists[index].id,
            promise,
        ]),
        mapArrayToObj(videoRequestPromises, (promise, index) => [
            requestedVideos[index].id,
            promise,
        ]),
        unwatchedVideos,
        appOptions,
    );

    const loading =
        playlistRequestPromises.some(
            (request) => request.status === 'loading',
        ) ||
        videoRequestPromises.some((request) => request.status === 'loading');

    function handleCopyButtonClick() {
        navigator.clipboard.writeText(
            visibleVideosList
                .map((video) => `https://youtube.com/watch?v=${video.videoId}`)
                .join(' '),
        );
    }

    return (
        <div className="collectionContainer">
            {visibleVideosList.map((video) => (
                <VideoCard
                    key={video.videoId}
                    video={video}
                    removeVideo={() =>
                        startTransition(() => {
                            dispatchUnwatchedVideos({
                                actionType: 'remove',
                                removedIds: video.videoId,
                            });
                        })
                    }
                />
            ))}
            {visibleVideosList.length === 0 && !loading ? (
                <NoVideosMessage appOptions={appOptions} />
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
                {loading ? (
                    <Typography
                        className="centerContentsY"
                        style={{ marginRight: '1rem' }}
                    >
                        Loading...
                    </Typography>
                ) : null}
                {visibleVideosList.length !== 0 ? (
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
                fetchedDoneVideos={doneVideosList}
                restoreVideo={(video) =>
                    dispatchUnwatchedVideos({
                        actionType: 'add',
                        newVideos: {
                            id: video.videoId,
                            playlistId: video.requestSourceId,
                            publishedAt: video.publishedAt,
                        },
                    })
                }
            />
        </div>
    );
}

const queryClient = new QueryClient();

interface UUVActionAdd {
    actionType: 'add';
    newVideos: UnwatchedVideo | UnwatchedVideo[];
}
interface UUVActionRemove {
    actionType: 'remove';
    removedIds: string | string[];
}

type UUVAction = UUVActionAdd | UUVActionRemove;
