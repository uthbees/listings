import { AppOptions } from '@/types';
import { getValidOption } from '@/utils/getValidOption';

export default function getLatestCutoff(options: AppOptions): Date {
    const now = new Date();
    if (!options.useWeeklyRefresh) {
        return now;
    }

    const refreshDay = getValidOption(
        options.weeklyRefreshDay,
        'weeklyRefreshDay',
    );
    const refreshHour = getValidOption(
        options.weeklyRefreshHour,
        'weeklyRefreshHour',
    );

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
