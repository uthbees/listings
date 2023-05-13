import getLatestCutoff from '@/utils/getLatestCutoff';
import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';

// This is a time nicely in the middle of the day and the middle of the month
//  (some tests rely on that for comparisons), but not exactly on the hour, so
//  it won't exactly coincide with any cutoffs.
jest.setSystemTime(new Date(2023, 0, 15, 12, 0, 0, 1));

describe('The cutoff date returned by getLatestCutoff', () => {
    it('Should be the current time if refreshes are disabled', () => {
        const latestCutoff = getLatestCutoff({
            useWeeklyRefresh: false,
            weeklyRefreshDay: 0,
            weeklyRefreshHour: 0,
        });
        expect(latestCutoff.getTime()).toBe(new Date().getTime());
    });

    it('Should be in the past if refreshes are enabled', () => {
        const latestCutoff = getLatestCutoff({ useWeeklyRefresh: true });
        expect(latestCutoff.getTime()).toBeLessThan(new Date().getTime());
    });

    it('Should have the specified day and hour', () => {
        const latestCutoff = getLatestCutoff({
            useWeeklyRefresh: true,
            weeklyRefreshDay: 2,
            weeklyRefreshHour: 1,
        });
        expect(latestCutoff.getDay()).toBe(2);
        expect(latestCutoff.getHours()).toBe(1);
    });

    it("Should have the default day and hour when they're not specified", () => {
        const latestCutoff = getLatestCutoff({ useWeeklyRefresh: true });
        expect(latestCutoff.getDay()).toBe(DEFAULT_WEEKLY_REFRESH_DAY);
        expect(latestCutoff.getHours()).toBe(DEFAULT_WEEKLY_REFRESH_HOUR);
    });

    it("Should be today if it's the cutoff day and the cutoff hour was earlier", () => {
        const latestCutoff = getLatestCutoff({
            useWeeklyRefresh: true,
            weeklyRefreshDay: new Date().getDay(),
            weeklyRefreshHour: new Date().getHours() - 1,
        });
        expect(latestCutoff.getDate()).toBe(new Date().getDate());
    });

    it("Should be last week if it's the cutoff day and the cutoff hour is later", () => {
        const latestCutoff = getLatestCutoff({
            useWeeklyRefresh: true,
            weeklyRefreshDay: new Date().getDay(),
            weeklyRefreshHour: new Date().getHours() + 1,
        });
        expect(latestCutoff.getDate()).toBe(new Date().getDate() - 7);
    });
});
