import { differenceInDays, format, isToday } from 'date-fns';
import getCutoff from '@/functions/getCutoff';
import { AppOptions } from '@/types/appConfig';

interface NoVideosMessageProps {
    appOptions: AppOptions;
}

export default function NoVideosMessage({ appOptions }: NoVideosMessageProps) {
    return <div className="centerInPage">{getEmptyMessage(appOptions)}</div>;
}

export const EMPTY_MESSAGE_BASE = 'Nothing here!';

export function getEmptyMessage(appOptions: AppOptions) {
    let message = EMPTY_MESSAGE_BASE;

    const nextCutoff = getCutoff(appOptions, 'next');

    if (appOptions.timedRefresh?.enabled) {
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
