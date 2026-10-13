import { describe, expect, it } from '@jest/globals';
import {
  addDays,
  dayInMonth,
  daysBetween,
  daysUntilPayday,
  isDayOfMonth,
  isValidIsoDate,
  localToday,
} from './calendar';

describe('calendar', () => {
  it('clamps a day to the month length', () => {
    expect(dayInMonth(2025, 4, 31)).toBe('2025-04-30');
    expect(dayInMonth(2024, 2, 31)).toBe('2024-02-29');
    expect(dayInMonth(2025, 2, 31)).toBe('2025-02-28');
    expect(dayInMonth(2025, 7, 31)).toBe('2025-07-31');
  });

  it('counts days until pay day', () => {
    expect(daysUntilPayday('2025-10-10', 25)).toBe(15);
    expect(daysUntilPayday('2025-10-25', 25)).toBe(31);
    expect(daysUntilPayday('2025-10-28', 25)).toBe(28);
    expect(daysUntilPayday('2025-04-30', 31)).toBe(31);
    expect(daysUntilPayday('2025-12-31', 1)).toBe(1);
    expect(daysUntilPayday('2025-12-26', 25)).toBe(30);
  });

  it('matches a clamped day of month', () => {
    expect(isDayOfMonth('2025-04-30', 31)).toBe(true);
    expect(isDayOfMonth('2025-04-29', 31)).toBe(false);
    expect(isDayOfMonth('2025-10-25', 25)).toBe(true);
  });

  it('adds days across months and years', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(daysBetween('2025-10-10', '2025-11-10')).toBe(31);
  });

  it('validates ISO dates', () => {
    expect(isValidIsoDate('2025-02-29')).toBe(false);
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2025-1-01')).toBe(false);
  });

  it('formats the local date', () => {
    expect(localToday(new Date(2025, 0, 5, 23, 30))).toBe('2025-01-05');
  });
});
