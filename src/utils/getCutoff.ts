import { AppOptions } from '@/types';
import { getValidOption } from '@/utils/getValidOption';
import { add, isBefore, setDay } from 'date-fns';

export default function getCutoff(
    options: AppOptions,
    cutoffType: 'latest' | 'next',
): Date {
    const now = new Date();
    if (!options.timedRefresh?.enabled) {
        return now;
    }

    const refreshPeriod = getValidOption(
        options.timedRefresh.refreshPeriod,
        'timedRefresh.refreshPeriod',
    );
    const refreshHour = getValidOption(
        options.timedRefresh.refreshHour,
        'timedRefresh.refreshHour',
    );

    // Start looking for cutoff dates two months ago - guaranteed to be before the latest one
    let cutoffDateNeedle = new Date();
    cutoffDateNeedle.setMonth(now.getMonth() - 2);
    // Set the hours correctly for the cutoff - we'll never touch them again.
    cutoffDateNeedle.setHours(refreshHour, 0,0,0);

    if (refreshPeriod.interval === 'weekly') {
        cutoffDateNeedle = setDay(cutoffDateNeedle, refreshPeriod.day);
    } else if (refreshPeriod.interval === 'monthly') {
        cutoffDateNeedle.setDate(refreshPeriod.day);
    }

    // Go from cutoff date to cutoff date until we find one that is after the
    //  current moment. The previous cutoff was the latest one.
    let nextNeedle = cutoffDateNeedle;
    while (isBefore(nextNeedle, now)) {
        cutoffDateNeedle = nextNeedle;

        if (refreshPeriod.interval === 'weekly') {
            nextNeedle = add(cutoffDateNeedle, { days: 7 });
        } else if (refreshPeriod.interval === 'monthly') {
            nextNeedle = add(cutoffDateNeedle, { months: 1 });
        }
    }

    return cutoffType === 'latest' ? cutoffDateNeedle : nextNeedle;
}
