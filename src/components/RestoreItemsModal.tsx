import {
    Chip,
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { FetchedVideo } from '@/types';

export default function RestoreItemsModal({
    open,
    onClose,
    fetchedDoneVideos,
    restoreVideo,
}: {
    open: boolean;
    onClose: () => void;
    fetchedDoneVideos: FetchedVideo[];
    restoreVideo: (restoredVideo: FetchedVideo) => void;
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Restore deleted items</DialogTitle>
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                }}
            >
                <Close />
            </IconButton>
            <div
                style={{
                    width: '600px',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        padding: '0px 25px 25px 25px',
                        height: '60vh',
                        overflow: 'scroll',
                        // TODO: Make the whole app use border-box.
                        boxSizing: 'border-box',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        style={{ marginBottom: '1rem', textAlign: 'center' }}
                    >
                        Old items deleted before this session may not be
                        available.
                    </Typography>
                    {fetchedDoneVideos.length > 0 ? (
                        fetchedDoneVideos.map((doneVideo) => (
                            <Chip
                                key={doneVideo.videoId}
                                label={doneVideo.videoTitle}
                                onDelete={() => restoreVideo(doneVideo)}
                                sx={{
                                    userSelect: 'unset',
                                    cursor: 'auto',
                                    margin: '4px',
                                }}
                            />
                        ))
                    ) : (
                        <Typography
                            style={{ width: '100%', textAlign: 'center' }}
                        >
                            Nothing here!
                        </Typography>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
