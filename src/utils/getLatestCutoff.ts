import { AppOptions } from '@/types';
import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';

export default function getLatestCutoff(options: AppOptions): Date {
    const now = new Date();
    if (!options.useWeeklyRefresh) {
        return now;
    }

    const refreshDay =
        typeof options.weeklyRefreshDay === 'number' &&
        options.weeklyRefreshDay >= 0 &&
        options.weeklyRefreshDay <= 6
            ? options.weeklyRefreshDay
            : DEFAULT_WEEKLY_REFRESH_DAY;

    const refreshHour =
        typeof options.weeklyRefreshHour === 'number' &&
        options.weeklyRefreshHour >= 0 &&
        options.weeklyRefreshHour <= 23
            ? options.weeklyRefreshHour
            : DEFAULT_WEEKLY_REFRESH_HOUR;

    // Get the difference in days and normalize it so that it's between 0 and 6
    const daysSinceLastRefreshDay = (now.getDay() - refreshDay + 7) % 7;

    const latestCutoffDate = new Date(now);
    latestCutoffDate.setHours(refreshHour, 0, 0, 0);
    latestCutoffDate.setDate(now.getDate() - daysSinceLastRefreshDay);

    // If it's the refresh day but the current time is before the refresh hour,
    //  subtract 7 days to get the previous refresh day
    if (now.getDay() === refreshDay && now.getHours() < refreshHour) {
        latestCutoffDate.setDate(latestCutoffDate.getDate() - 7);
    }

    return latestCutoffDate;
}
