import { AppOptions } from '@/types';
import { differenceInDays, format, isToday } from 'date-fns';
import getCutoff from '@/utils/getCutoff';

interface NoVideosMessageProps {
    stillLoading: boolean;
    options: AppOptions;
}

export default function NoVideosMessage({
    stillLoading,
    options,
}: NoVideosMessageProps) {
    return (
        <div className="centerInPage">
            {stillLoading ? 'Loading...' : getEmptyMessage(options)}
        </div>
    );
}

export const EMPTY_MESSAGE_BASE = 'Nothing here!';

export function getEmptyMessage(options: AppOptions) {
    let message = EMPTY_MESSAGE_BASE;

    const nextCutoff = getCutoff(options, 'next');

    if (options.timedRefresh?.enabled) {
        message += ' Check back after ' + format(nextCutoff, 'p');

        if (isToday(nextCutoff)) {
            message += '!';
        } else if (Math.abs(differenceInDays(new Date(), nextCutoff)) < 7) {
            message += ' next ' + format(nextCutoff, 'iiii') + '!';
        } else {
            message += ` on the ${format(nextCutoff, 'do')}!`;
        }
    }

    return message;
}
