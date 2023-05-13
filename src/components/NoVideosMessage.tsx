import { AppOptions } from '@/types';
import { format } from 'date-fns';
import getLatestCutoff from '@/utils/getLatestCutoff';

interface NoVideosMessageProps {
    stillLoading: boolean;
    options: AppOptions;
}

const BASE_EMPTY_MESSAGE = 'Nothing here!';

export default function NoVideosMessage({
    stillLoading,
    options,
}: NoVideosMessageProps) {
    return (
        <div className="centerInPage" data-testid="noVideosMessage">
            {stillLoading ? 'Loading...' : getEmptyMessage(options)}
        </div>
    );
}

function getEmptyMessage(options: AppOptions) {
    if (options.useWeeklyRefresh) {
        const latestCutoff = getLatestCutoff(options);

        let message =
            BASE_EMPTY_MESSAGE +
            ' Check back after ' +
            format(latestCutoff, 'p');

        if (
            options.weeklyRefreshDay &&
            new Date().getDay() === options.weeklyRefreshDay
        ) {
            message += '!';
        } else {
            message += ' next ' + format(latestCutoff, 'iiii') + '!';
        }

        return message;
    }

    return BASE_EMPTY_MESSAGE;
}
