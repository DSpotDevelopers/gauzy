// import { describe, it, expect } from 'jest';
import * as moment from 'moment';
import { generateTimeSlots, getStartEndIntervals } from './utils';

/**
 * Factory for generating test data
 */
class TestDataFactory {
	/**
	 * Generate a random date within a specified range
	 * @param start - Start of date range
	 * @param end - End of date range
	 * @returns A random date within the range
	 */
	static randomDate(start: Date = new Date(2023, 0, 1), end: Date = new Date()): Date {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

	/**
	 * Generate a pair of dates where end is after start
	 * @param minDuration - Minimum duration between dates in minutes
	 * @param maxDuration - Maximum duration between dates in minutes
	 * @returns An object with start and end dates
	 */
	static randomDatePair(minDuration = 5, maxDuration = 120): { start: Date; end: Date } {
		const start = this.randomDate();
		const durationMs = (minDuration + Math.random() * (maxDuration - minDuration)) * 60 * 1000;
		const end = new Date(start.getTime() + durationMs);
		return { start, end };
	}

	/**
	 * Generate a date with specific minute properties for testing edge cases
	 * @param minuteValue - The specific minute value to set
	 * @returns A date with the specified minute value
	 */
	static dateWithSpecificMinute(minuteValue: number): Date {
		const date = this.randomDate();
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minuteValue, 0);
	}

	/**
	 * Generate a random previous time value in seconds
	 * @param max - Maximum value in seconds
	 * @returns A random number of seconds
	 */
	static randomPreviousTime(max = 600): number {
		return Math.floor(Math.random() * max);
	}
}

describe('Time Slot Utils', () => {
	describe('generateTimeSlots', () => {
		it('should generate time slots between start and end dates', () => {
			// Generate random test data
			const { start, end } = TestDataFactory.randomDatePair(15, 30);

			// Generate time slots
			const slots = generateTimeSlots(start, end);

			// Verify time slots are generated
			expect(slots.length).toBeGreaterThan(0);
			expect(new Date(slots[0].startedAt).getTime()).toBeLessThanOrEqual(start.getTime());
			expect(new Date(slots[slots.length - 1].stoppedAt).getTime()).toBeGreaterThanOrEqual(end.getTime());
            slots.forEach(slot => {
                expect(slot.startedAt.getTime()).toBeLessThan(slot.stoppedAt.getTime());
            })
		});

		it('should create slots with 10-minute intervals', () => {
			// Generate random test data with longer duration to ensure multiple slots
			const { start, end } = TestDataFactory.randomDatePair(25, 40);

			// Generate time slots
			const slots = generateTimeSlots(start, end);

			// Verify each slot has a 10-minute duration
			for (let i = 0; i < slots.length; i++) {
				const slotStart = new Date(slots[i].startedAt);
				const slotEnd = new Date(slots[i].stoppedAt);
				const durationMinutes = (slotEnd.getTime() - slotStart.getTime()) / (60 * 1000);

				// Duration should be 10 minutes
				expect(durationMinutes).toBe(10);
			}
		});

		it('should handle start times that are not on 10-minute boundaries', () => {
			// Create a start time with a minute value not divisible by 10
			const start = TestDataFactory.dateWithSpecificMinute(7);
			const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes later

			// Generate time slots
			const slots = generateTimeSlots(start, end);

			// Every slot starts at a 10-minute boundary
			slots.forEach(slot => {
				expect(slot.startedAt.getMinutes() % 10).toBe(0);
			})
		});

		it('should account for previousTime parameter', () => {
			// Generate random test data
			const { start, end } = TestDataFactory.randomDatePair(20, 30);
			const previousTime = TestDataFactory.randomPreviousTime(300); // 0-5 minutes in seconds

			// Generate time slots with and without previousTime
			const slotsWithPrevious = generateTimeSlots(start, end, previousTime);
			const slotsWithoutPrevious = generateTimeSlots(start, end);

			// Calculate total duration for both sets of slots
			const totalDurationWithoutPrevious = slotsWithoutPrevious.reduce((sum, slot) => sum + slot.duration, 0);
			const totalDurationWithPrevious = slotsWithPrevious.reduce((sum, slot) => sum + slot.duration, 0);

            // Number of slots should be the same
            expect(slotsWithPrevious.length).toBe(slotsWithoutPrevious.length);

            // Slots should be the same
            slotsWithPrevious.forEach((slot, index) => {
                expect(slot.startedAt).toEqual(slotsWithoutPrevious[index].startedAt);
                expect(slot.stoppedAt).toEqual(slotsWithoutPrevious[index].stoppedAt);
            })

			// Difference between total duration with and without previous time should be equal to previousTime
			expect(totalDurationWithoutPrevious - totalDurationWithPrevious).toBe(previousTime);

		});

		it('should handle edge case where end time is before start time', () => {
			// Create a scenario where end is before start
			const end = TestDataFactory.randomDate();
			const start = new Date(end.getTime() + 10 * 60 * 1000); // 10 minutes after end

			// Generate time slots
			const slots = generateTimeSlots(start, end);

			// Should return empty array
			expect(slots).toEqual([]);
		});

		it('should handle edge case where start and end times are the same', () => {
			// Create a scenario where start and end are the same
			const date = TestDataFactory.randomDate();

			// Generate time slots
			const slots = generateTimeSlots(date, date);

			// Should return empty array
			expect(slots).toEqual([]);
		});
	});

	describe('getStartEndIntervals', () => {
		it('should round start and end times to 10-minute intervals', () => {
			// Generate random test data
			const randomMinuteStart = Math.floor(Math.random() * 60);
			const randomMinuteEnd = Math.floor(Math.random() * 60);

			const start = moment(TestDataFactory.dateWithSpecificMinute(randomMinuteStart));
			const end = moment(TestDataFactory.dateWithSpecificMinute(randomMinuteEnd));

			// Generate the start and end 10 minute values
			const result = getStartEndIntervals(start, end);

			// Verify start is rounded down to nearest 10-minute interval
			const expectedStartMinute = randomMinuteStart - (randomMinuteStart % 10);
			expect(moment(result.start).utc().minutes()).toBe(expectedStartMinute);

			// Verify end is rounded down to nearest 10-minute interval and then add 10 minutes
			const expectedEndMinute = (randomMinuteEnd - (randomMinuteEnd % 10) + 10) % 60;
			expect(moment(result.end).utc().minutes()).toBe(expectedEndMinute);
		});

		it('should set seconds and milliseconds to zero', () => {
			// Create moments with non-zero seconds and milliseconds
			const start = moment().seconds(30).milliseconds(500);
			const end = moment().add(20, 'minutes').seconds(45).milliseconds(800);

			// Generate the start and end 10 minute values
			const result = getStartEndIntervals(start, end);

			// Verify seconds and milliseconds are set to zero
			expect(moment(result.start).seconds()).toBe(0);
			expect(moment(result.start).milliseconds()).toBe(0);
			expect(moment(result.end).seconds()).toBe(0);
			expect(moment(result.end).milliseconds()).toBe(0);
		});

		it('should handle UTC conversion correctly', () => {
			// Create non-UTC moments
			const start = moment().utcOffset(120); // UTC+2
			const end = moment().add(30, 'minutes').utcOffset(120); // UTC+2

			// Generate the start and end 10 minute nearest values
			const result = getStartEndIntervals(start, end);

			// Verify timezone difference is 2 hours
			expect(start.hours() - moment(result.start).utc().hours()).toBe(2);
			expect(end.hours() - moment(result.end).utc().hours()).toBe(2);
		});
	});
});
