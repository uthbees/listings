import getLatestCutoff from '@/utils/getLatestCutoff';
import {
    DEFAULT_WEEKLY_REFRESH_DAY,
    DEFAULT_WEEKLY_REFRESH_HOUR,
} from '@/utils/constants';
import {
    EMPTY_MESSAGE_BASE,
    getEmptyMessage,
} from '@/components/NoVideosMessage';
import { AppOptions } from '@/types';

// This is a time nicely in the middle of the day and the middle of the month
//  (some tests expect it to be for comparisons), but not exactly on the hour, so
//  it won't exactly coincide with any cutoffs.
// Note also that some tests expect it to be a Sunday, although that's arbitrary.
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
    describe('With refreshes enabled', () => {
        it('Should be in the past', () => {
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

        it('Should default to the default day and hour', () => {
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
});

describe('The empty message', () => {
    it('Should be the base empty message if refreshes are disabled', () => {
        const message = getEmptyMessageGivenOptions({
            useWeeklyRefresh: false,
        });
        expect(message).toBe(EMPTY_MESSAGE_BASE);
    });

    describe('With refreshes enabled', () => {
        it('Should have more text than the base empty message', () => {
            const message = getEmptyMessageGivenOptions({
                useWeeklyRefresh: true,
            });
            expect(message).not.toBe(EMPTY_MESSAGE_BASE);
            expect(message).toContain(EMPTY_MESSAGE_BASE);
        });

        it('Should specify the refresh hour', () => {
            const message = getEmptyMessageGivenOptions({
                useWeeklyRefresh: true,
                weeklyRefreshHour: 15,
            });
            expect(message).toContain('3:00 PM');
        });

        it("Should specify the refresh day if it's a different day", () => {
            const message = getEmptyMessageGivenOptions({
                useWeeklyRefresh: true,
                weeklyRefreshDay: 3,
            });
            expect(new Date().getDay()).not.toBe(3);
            expect(message).toContain('Wednesday');
        });

        it("Should specify the refresh day if it's today and the refresh hour was earlier", () => {
            // It should do this because the next cutoff date is now next week, not today.
            const message = getEmptyMessageGivenOptions({
                useWeeklyRefresh: true,
                weeklyRefreshDay: 0,
                weeklyRefreshHour: new Date().getHours(), // We're after this hour now, so the hour was indeed earlier.
            });
            expect(new Date().getDay()).toBe(0);
            expect(message).toContain('Sunday');
        });

        it("Should not specify the refresh day if it's today and the refresh hour is later", () => {
            const message = getEmptyMessageGivenOptions({
                useWeeklyRefresh: true,
                weeklyRefreshDay: 0,
                weeklyRefreshHour: new Date().getHours() + 1,
            });
            expect(new Date().getDay()).toBe(0);
            expect(message).not.toContain('Sunday');
        });
    });
});

function getEmptyMessageGivenOptions(options: AppOptions) {
    return getEmptyMessage(options, getLatestCutoff(options));
}
