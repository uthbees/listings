import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_MONTHLY_REFRESH_DAY,
    DEFAULT_TIMED_REFRESH_HOUR,
} from '@/constants';
import isAnObject from '@/functions/objUtils/isAnObject';
import { AppOptionsRefreshPeriod } from '@/types/appConfig';

export function getValidOption(
    option: AppOptionsRefreshPeriod | undefined,
    optionName: 'timedRefresh.refreshPeriod',
): Required<AppOptionsRefreshPeriod>;
export function getValidOption(
    option: number | undefined,
    optionName: 'timedRefresh.refreshHour',
): number;
export function getValidOption(option: unknown, optionName: unknown) {
    switch (optionName) {
        case 'timedRefresh.refreshPeriod':
            if (isAnObject(option)) {
                if ('interval' in option && option?.interval === 'monthly') {
                    if (
                        'day' in option &&
                        typeof option?.day === 'number' &&
                        option?.day >= 1 &&
                        option?.day <= 31
                    ) {
                        return option;
                    }
                    return {
                        interval: 'monthly',
                        day: DEFAULT_MONTHLY_REFRESH_DAY,
                    };
                }

                if (
                    'day' in option &&
                    typeof option?.day === 'number' &&
                    option?.day >= 0 &&
                    option?.day <= 6
                ) {
                    return option;
                }
            }
            return { interval: 'weekly', day: DEFAULT_WEEKLY_REFRESH_DAY };
        case 'timedRefresh.refreshHour':
            return typeof option === 'number' && option >= 0 && option <= 23
                ? option
                : DEFAULT_TIMED_REFRESH_HOUR;
        default:
            throw new Error(
                `Option ${optionName} not supported by getValidOption`,
            );
    }
}
