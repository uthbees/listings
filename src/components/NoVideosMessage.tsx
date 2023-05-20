import { AppOptions } from '@/types';
import { format } from 'date-fns';
import getLatestCutoff from '@/utils/getLatestCutoff';
import { getValidOption } from '@/utils/getValidOption';

interface NoVideosMessageProps {
    stillLoading: boolean;
    options: AppOptions;
}

export default function NoVideosMessage({
    stillLoading,
    options,
}: NoVideosMessageProps) {
    return (
        <div className="centerInPage" data-testid="noVideosMessage">
            {stillLoading
                ? 'Loading...'
                : getEmptyMessage(options, getLatestCutoff(options))}
        </div>
    );
}

export const EMPTY_MESSAGE_BASE = 'Nothing here!';

export function getEmptyMessage(options: AppOptions, latestCutoff: Date) {
    let message = EMPTY_MESSAGE_BASE;

    if (options.useWeeklyRefresh) {
        const refreshDay = getValidOption(
            options.weeklyRefreshDay,
            'weeklyRefreshDay',
        );
        const refreshHour = getValidOption(
            options.weeklyRefreshHour,
            'weeklyRefreshHour',
        );

        message += ' Check back after ' + format(latestCutoff, 'p');

        if (
            new Date().getDay() !== refreshDay ||
            new Date().getHours() >= refreshHour
        ) {
            message += ' next ' + format(latestCutoff, 'iiii') + '!';
        } else {
            message += '!';
        }
    }

    return message;
}
