package com.example.dailyfund_v2

import com.example.dailyfund_v2.Transaction.Transaction
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

/** Budget vs spending of one closed day. [date] is ISO (yyyy-MM-dd). */
data class DayRecord(val date: String, val budget: Float, val spent: Float) {
    val diff: Float get() = budget - spent
}

data class BudgetSettings(val salary: Float, val desiredMonthlySavings: Float, val payDay: Int)

/**
 * Invariant: currentMonthFund = moneyForToday + moneyPerDay * (daysUntilPayday - 1) + balance.
 * [currentDay] is the day [moneyForToday] belongs to; null means the budget is not set up yet.
 */
data class BudgetState(
    val currentMonthFund: Float,
    val moneyPerDay: Float,
    val moneyForToday: Float,
    val balance: Float,
    val currentDay: LocalDate?,
    val history: List<DayRecord>
)

object Budget {

    /** Pay day of [month], clamped to its last day (e.g. pay day 31 in April -> April 30). */
    fun paydayIn(month: YearMonth, payDay: Int): LocalDate =
        month.atDay(minOf(payDay, month.lengthOfMonth()))

    fun isPayday(date: LocalDate, payDay: Int): Boolean =
        date == paydayIn(YearMonth.from(date), payDay)

    /** Days from [today] (included) to the next pay day (excluded). */
    fun daysUntilPayday(today: LocalDate, payDay: Int): Int {
        val month = YearMonth.from(today)
        val thisMonth = paydayIn(month, payDay)
        val next = if (thisMonth.isAfter(today)) thisMonth else paydayIn(month.plusMonths(1), payDay)
        return ChronoUnit.DAYS.between(today, next).toInt()
    }

    fun setUp(fund: Float, today: LocalDate, payDay: Int): BudgetState =
        recalculate(BudgetState(fund, 0f, 0f, 0f, today, emptyList()), payDay)

    /** Recomputes money per day from the fund, keeping the balance and today's spending. */
    fun recalculate(state: BudgetState, payDay: Int): BudgetState {
        val day = requireNotNull(state.currentDay) { "Budget is not set up" }
        val spentToday = state.moneyPerDay - state.moneyForToday
        val perDay = (state.currentMonthFund - state.balance + spentToday) / daysUntilPayday(day, payDay)
        return state.copy(moneyPerDay = perDay, moneyForToday = perDay - spentToday)
    }

    /** Moves the whole balance into the daily budget of the remaining days. */
    fun spread(state: BudgetState, payDay: Int): BudgetState =
        recalculate(state.copy(balance = 0f), payDay)

    /**
     * Closes every day from currentDay up to (excluding) [today], including days the app was not opened:
     * the leftover goes to the balance and a [DayRecord] is stored. Pay days crossed add the salary.
     */
    fun advanceTo(state: BudgetState, today: LocalDate, settings: BudgetSettings): BudgetState {
        var s = state
        var day = s.currentDay ?: return state
        while (day.isBefore(today)) {
            val record = DayRecord(day.toString(), s.moneyPerDay, s.moneyPerDay - s.moneyForToday)
            day = day.plusDays(1)
            s = s.copy(
                balance = s.balance + s.moneyForToday,
                moneyForToday = s.moneyPerDay,
                currentDay = day,
                history = s.history + record
            )
            if (isPayday(day, settings.payDay)) {
                val income = settings.salary - settings.desiredMonthlySavings
                s = recalculate(s.copy(currentMonthFund = s.currentMonthFund + income), settings.payDay)
            }
        }
        return s
    }

    fun applyTransaction(state: BudgetState, tx: Transaction): BudgetState = apply(state, tx, 1f)

    fun revertTransaction(state: BudgetState, tx: Transaction): BudgetState = apply(state, tx, -1f)

    /**
     * Income (amount >= 0) goes to the fund and the balance, never to today's money.
     * An expense today reduces today's money; an expense on a closed day reduces the balance and that day's record.
     */
    private fun apply(state: BudgetState, tx: Transaction, factor: Float): BudgetState {
        val amount = tx.amount * factor
        val fund = state.currentMonthFund + amount
        if (tx.amount >= 0) {
            return state.copy(currentMonthFund = fund, balance = state.balance + amount)
        }
        if (tx.localDate == state.currentDay) {
            return state.copy(currentMonthFund = fund, moneyForToday = state.moneyForToday + amount)
        }
        val history = state.history.map { if (it.date == tx.date) it.copy(spent = it.spent - amount) else it }
        return state.copy(currentMonthFund = fund, balance = state.balance + amount, history = history)
    }
}
