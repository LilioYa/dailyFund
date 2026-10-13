# DailyFund

Android app that turns the money left until your next payday into a **daily spending budget**, tracks what you spend,
and carries any surplus or overspending forward.

## Features
- **Daily budget**: money left this month ÷ days until the next pay day. On pay day, `salary - desired savings` is
  added to the month's money.
- **Transactions** (entered manually): a negative amount is an expense, a positive amount is income.
  - An expense dated today reduces today's money. An expense on an earlier day reduces the balance.
  - Income is added to the month's money and to the balance, never to today's money.
  - Long-press a transaction to edit or delete it.
- **Balance**: each day's leftover (or overspending) is added to the balance when the day ends, including days the
  app wasn't opened.
- **History**: per-day budget vs spent on the main screen, green when under budget, red when over.
- **Spread**: spreads the whole balance over the remaining days by recalculating the daily budget, then resets the
  balance to 0.

## Setup
Open **Settings** and enter your salary, desired monthly savings, pay date (day of the month; 31 means the last day
of shorter months) and the money you have left this month.

## Build
Requires Android Studio's bundled JDK 17 (Gradle 8.7 doesn't run on newer JDKs) and min SDK 26.

```
./gradlew testDebugUnitTest assembleDebug
```

## Not done yet
- Automatic transaction retrieval
- Search and sort on the Transactions screen
