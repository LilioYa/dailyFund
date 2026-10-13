/** A calendar day as `YYYY-MM-DD`. ISO strings compare correctly with `<` / `>`. */
export type IsoDate = string;

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcMs(date: IsoDate): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Today's date in the device's time zone. */
export function localToday(now: Date = new Date()): IsoDate {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isValidIsoDate(text: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && fromUtcMs(toUtcMs(text)) === text;
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

/** Number of days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** `month` is 1-12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The given day of month, clamped to the month's last day (e.g. day 31 in April -> April 30). */
export function dayInMonth(year: number, month: number, day: number): IsoDate {
  const clamped = Math.min(day, daysInMonth(year, month));
  return fromUtcMs(Date.UTC(year, month - 1, clamped));
}

/** Whether `date` is the (clamped) `day` of its month. */
export function isDayOfMonth(date: IsoDate, day: number): boolean {
  const [year, month] = date.split('-').map(Number);
  return dayInMonth(year, month, day) === date;
}

/** Days from `today` (included) to the next pay day (excluded). Always between 1 and 31. */
export function daysUntilPayday(today: IsoDate, payDay: number): number {
  const [year, month] = today.split('-').map(Number);
  const thisMonth = dayInMonth(year, month, payDay);
  const next =
    thisMonth > today
      ? thisMonth
      : month === 12
        ? dayInMonth(year + 1, 1, payDay)
        : dayInMonth(year, month + 1, payDay);
  return daysBetween(today, next);
}
