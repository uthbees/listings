import { AppOptions } from '@/types';
import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';

export default function getLatestCutoff(options: AppOptions): Date {
    if (!options.useWeeklyRefresh) {
        return new Date();
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

    const latestCutoffDate = new Date();
    latestCutoffDate.setHours(refreshHour, 0, 0, 0);

    const dayDistance = refreshDay - latestCutoffDate.getDay();

    latestCutoffDate.setDate(latestCutoffDate.getDay() + dayDistance);

    return latestCutoffDate;
}
