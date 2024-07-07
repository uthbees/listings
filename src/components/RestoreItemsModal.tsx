import {
    Chip,
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function RestoreItemsModal({
    open,
    onClose,
    doneVideoIDs,
    restoreVideoID,
}: {
    open: boolean;
    onClose: () => void;
    doneVideoIDs: string[];
    restoreVideoID: (restoredVideoID: string) => void;
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
                    {doneVideoIDs.length > 0 ? (
                        doneVideoIDs.map((doneVideoID) => (
                            <Chip
                                key={doneVideoID}
                                label={doneVideoID}
                                onDelete={() => restoreVideoID(doneVideoID)}
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
