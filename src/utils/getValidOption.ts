import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';

export function getValidOption(
    option: number | undefined,
    optionName: 'weeklyRefreshDay',
): number;
export function getValidOption(
    option: number | undefined,
    optionName: 'weeklyRefreshHour',
): number;
export function getValidOption(option: unknown, optionName: unknown) {
    switch (optionName) {
        case 'weeklyRefreshDay':
            return typeof option === 'number' && option >= 0 && option <= 6
                ? option
                : DEFAULT_WEEKLY_REFRESH_DAY;
        case 'weeklyRefreshHour':
            return typeof option === 'number' && option >= 0 && option <= 23
                ? option
                : DEFAULT_WEEKLY_REFRESH_HOUR;
        default:
            throw new Error('Option not supported by getValidOption');
    }
}
