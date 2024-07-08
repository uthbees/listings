import {
    Chip,
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { DoneVideo } from '@/types';

export default function RestoreItemsModal({
    open,
    onClose,
    doneVideos,
    restoreVideo,
}: {
    open: boolean;
    onClose: () => void;
    doneVideos: DoneVideo[];
    restoreVideo: (restoredVideoID: string) => void;
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
                    {doneVideos.length > 0 ? (
                        // The array of done videos is ordered from oldest to newest, so we flip it to display the
                        // videos that were most recently marked as done first.
                        doneVideos.toReversed().map((doneVideo: DoneVideo) => (
                            <Chip
                                key={doneVideo.id}
                                label={
                                    doneVideo.title !== undefined
                                        ? doneVideo.title
                                        : `Title unavailable (id: ${doneVideo.id})`
                                }
                                onDelete={() => restoreVideo(doneVideo.id)}
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
