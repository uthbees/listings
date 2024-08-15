import { UnwatchedVideo } from '@/types';
import {
    QueryClient,
    QueryClientProvider,
    useQueries,
} from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import createVideoList from '@/functions/createVideoList';
import fetchPlaylistVideos, {
    warnAboutMissingVideos,
} from '@/functions/fetchPlaylistVideos';
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
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
const queryClient = new QueryClient();

export default function Listings({ appConfig }: ListingsProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ListingsInternal appConfig={appConfig} />
        </QueryClientProvider>
    );
}

function ListingsInternal({ appConfig }: ListingsProps) {
    const [restorationModalOpen, setRestorationModalOpen] = useState(false);
    // Sometimes we want to show a notice when a playlist is missing (has no request). This tracks which ones we've shown the notice for.
    const [warnedMissingPlaylistIds, setWarnedMissingPlaylistIds] = useState<
        string[]
    >([]);

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

    const markVideosAsDone = useCallback(
        (videoIds: string | string[]) =>
            dispatchUnwatchedVideos({
                actionType: 'remove',
                removedIds: videoIds,
            }),
        [],
    );
    const markVideosAsUnwatched = useCallback(
        (videos: UnwatchedVideo | UnwatchedVideo[]) =>
            dispatchUnwatchedVideos({
                actionType: 'add',
                newVideos: videos,
            }),
        [],
    );

    const requestedPlaylists: ConfigPlaylistRequest[] = useMemo(
        () => appConfig.requests?.playlists || [],
        [appConfig.requests?.playlists],
    );
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
                    markVideosAsDone,
                    markVideosAsUnwatched,
                }),
        })),
    });

    // Warn about any unwatched videos with playlist ids that don't have a request.
    useEffect(() => {
        const unwatchedVideoUniquePlaylistIds = new Set<string>();

        unwatchedVideos.forEach((unwatchedVideo) => {
            unwatchedVideoUniquePlaylistIds.add(unwatchedVideo.playlistId);
        });

        const requestedPlaylistIds = new Set<string>();

        requestedPlaylists.forEach((requestedPlaylist) => {
            requestedPlaylistIds.add(requestedPlaylist.id);
        });

        const missingPlaylistIds =
            unwatchedVideoUniquePlaylistIds.difference(requestedPlaylistIds);

        missingPlaylistIds.forEach((missingPlaylistId) => {
            // Don't show this warning if we've already shown it.
            // Note: Warnings do appear twice in development mode because of strict mode, but to fix it properly, we
            // would need to set up an actual UI instead of just using alerts, and I don't care that much.
            if (warnedMissingPlaylistIds.includes(missingPlaylistId)) {
                return;
            }
            setWarnedMissingPlaylistIds((prevState) => [
                ...prevState,
                missingPlaylistId,
            ]);

            const missingVideoIds = unwatchedVideos
                .filter((video) => video.playlistId === missingPlaylistId)
                .map((video) => video.id);

            warnAboutUnwatchedVideosWithNoPlaylist(
                missingVideoIds,
                missingPlaylistId,
                markVideosAsDone,
            );
        });
    }, [
        markVideosAsDone,
        requestedPlaylists,
        unwatchedVideos,
        warnedMissingPlaylistIds,
    ]);

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

function warnAboutUnwatchedVideosWithNoPlaylist(
    missingVideoIds: string[],
    playlistId: string,
    markVideosAsDone: (videoIds: string[]) => void,
) {
    let alertMessage: string;
    if (missingVideoIds.length === 1) {
        alertMessage = `The unwatched video with id ${missingVideoIds[0]} has a playlist id ${playlistId}, but there is no request for that playlist.`;
    } else {
        alertMessage = `There are ${missingVideoIds.length} videos with a playlist id of ${playlistId}, but there is no request for that playlist. See console for video ids.`;
    }

    warnAboutMissingVideos(
        `There are ${missingVideoIds.length} unwatched videos with a playlist id of ${playlistId}, but there is no request for that playlist.`,
        alertMessage,
        missingVideoIds,
        markVideosAsDone,
    );
}

interface UUVActionAdd {
    actionType: 'add';
    newVideos: UnwatchedVideo | UnwatchedVideo[];
}
interface UUVActionRemove {
    actionType: 'remove';
    removedIds: string | string[];
}

type UUVAction = UUVActionAdd | UUVActionRemove;
