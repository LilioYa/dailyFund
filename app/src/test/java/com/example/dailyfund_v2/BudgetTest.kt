package com.example.dailyfund_v2

import com.example.dailyfund_v2.Transaction.Transaction
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate
import java.time.YearMonth

class BudgetTest {
    private val delta = 0.001f
    private val payDay = 25
    private val settings = BudgetSettings(salary = 1000f, desiredMonthlySavings = 200f, payDay = payDay)
    private val oct10: LocalDate = LocalDate.of(2025, 10, 10)

    /** fund = today + perDay * (remaining days - 1) + balance must always hold. */
    private fun assertInvariant(s: BudgetState) {
        val days = Budget.daysUntilPayday(s.currentDay!!, payDay)
        assertEquals(s.currentMonthFund, s.moneyForToday + s.moneyPerDay * (days - 1) + s.balance, delta)
    }

    private fun expense(amount: Float, date: LocalDate) = Transaction("x", -amount, date.toString())
    private fun income(amount: Float, date: LocalDate) = Transaction("x", amount, date.toString())

    // Calendar

    @Test
    fun paydayIsClampedToMonthEnd() {
        assertEquals(LocalDate.of(2025, 4, 30), Budget.paydayIn(YearMonth.of(2025, 4), 31))
        assertEquals(LocalDate.of(2024, 2, 29), Budget.paydayIn(YearMonth.of(2024, 2), 31))
        assertEquals(LocalDate.of(2025, 2, 28), Budget.paydayIn(YearMonth.of(2025, 2), 31))
        assertEquals(LocalDate.of(2025, 7, 31), Budget.paydayIn(YearMonth.of(2025, 7), 31))
    }

    @Test
    fun daysUntilPayday() {
        assertEquals(15, Budget.daysUntilPayday(oct10, 25))
        assertEquals(31, Budget.daysUntilPayday(LocalDate.of(2025, 10, 25), 25))
        assertEquals(28, Budget.daysUntilPayday(LocalDate.of(2025, 10, 28), 25))
        assertEquals(31, Budget.daysUntilPayday(LocalDate.of(2025, 4, 30), 31))
        assertEquals(1, Budget.daysUntilPayday(LocalDate.of(2025, 12, 31), 1))
    }

    // Budget

    @Test
    fun setUpSplitsFundOverDaysUntilPayday() {
        val s = Budget.setUp(300f, oct10, payDay)
        assertEquals(20f, s.moneyPerDay, delta)
        assertEquals(20f, s.moneyForToday, delta)
        assertEquals(0f, s.balance, delta)
        assertInvariant(s)
    }

    @Test
    fun expenseTodayReducesTodaysMoney() {
        val s = Budget.applyTransaction(Budget.setUp(300f, oct10, payDay), expense(5f, oct10))
        assertEquals(15f, s.moneyForToday, delta)
        assertEquals(295f, s.currentMonthFund, delta)
        assertEquals(0f, s.balance, delta)
        assertInvariant(s)
    }

    @Test
    fun incomeGoesToFundAndBalanceNotToday() {
        val s = Budget.applyTransaction(Budget.setUp(300f, oct10, payDay), income(50f, oct10))
        assertEquals(20f, s.moneyForToday, delta)
        assertEquals(350f, s.currentMonthFund, delta)
        assertEquals(50f, s.balance, delta)
        assertInvariant(s)
    }

    @Test
    fun advanceClosesEveryElapsedDayIncludingMissedOnes() {
        val start = Budget.applyTransaction(Budget.setUp(300f, oct10, payDay), expense(5f, oct10))
        val s = Budget.advanceTo(start, oct10.plusDays(2), settings)

        assertEquals(oct10.plusDays(2), s.currentDay)
        assertEquals(35f, s.balance, delta) // 15 left on day 1 + 20 on day 2 (not opened)
        assertEquals(20f, s.moneyForToday, delta)
        assertEquals(
            listOf(DayRecord("2025-10-10", 20f, 5f), DayRecord("2025-10-11", 20f, 0f)),
            s.history
        )
        assertInvariant(s)
    }

    @Test
    fun advanceToSameDayDoesNothing() {
        val start = Budget.setUp(300f, oct10, payDay)
        assertEquals(start, Budget.advanceTo(start, oct10, settings))
    }

    @Test
    fun advanceOnUnsetBudgetDoesNothing() {
        val unset = BudgetState(0f, 0f, 0f, 0f, null, emptyList())
        assertNull(Budget.advanceTo(unset, oct10, settings).currentDay)
    }

    @Test
    fun expenseOnClosedDayHitsBalanceAndThatDaysRecord() {
        val start = Budget.advanceTo(Budget.setUp(300f, oct10, payDay), oct10.plusDays(1), settings)
        val s = Budget.applyTransaction(start, expense(8f, oct10))

        assertEquals(12f, s.balance, delta)
        assertEquals(20f, s.moneyForToday, delta)
        assertEquals(DayRecord("2025-10-10", 20f, 8f), s.history.single())
        assertInvariant(s)
    }

    @Test
    fun revertUndoesApply() {
        val start = Budget.advanceTo(Budget.setUp(300f, oct10, payDay), oct10.plusDays(1), settings)
        for (tx in listOf(expense(8f, oct10), expense(3f, oct10.plusDays(1)), income(50f, oct10))) {
            assertEquals(start, Budget.revertTransaction(Budget.applyTransaction(start, tx), tx))
        }
    }

    @Test
    fun editIsRevertOldThenApplyNew() {
        val start = Budget.setUp(300f, oct10, payDay)
        val old = expense(5f, oct10)
        val new = expense(7f, oct10)
        val edited = Budget.applyTransaction(Budget.revertTransaction(Budget.applyTransaction(start, old), old), new)
        assertEquals(Budget.applyTransaction(start, new), edited)
    }

    @Test
    fun paydayAddsSalaryMinusSavingsAndKeepsBalance() {
        val oct23 = LocalDate.of(2025, 10, 23)
        val start = Budget.setUp(40f, oct23, payDay) // 2 days -> 20/day
        val s = Budget.advanceTo(start, LocalDate.of(2025, 10, 25), settings)

        assertEquals(40f, s.balance, delta) // both days unspent
        assertEquals(840f, s.currentMonthFund, delta)
        assertEquals(800f / 31, s.moneyPerDay, delta) // Oct 25 -> Nov 25
        assertEquals(800f / 31, s.moneyForToday, delta)
        assertInvariant(s)
    }

    @Test
    fun spreadMovesBalanceIntoDailyBudget() {
        val start = Budget.applyTransaction(Budget.setUp(300f, oct10, payDay), expense(5f, oct10))
        val advanced = Budget.applyTransaction(Budget.advanceTo(start, oct10.plusDays(2), settings), expense(4f, oct10.plusDays(2)))
        val s = Budget.spread(advanced, payDay)

        assertEquals(0f, s.balance, delta)
        // fund 291 + 4 spent today over 13 remaining days
        assertEquals(295f / 13, s.moneyPerDay, delta)
        assertEquals(295f / 13 - 4f, s.moneyForToday, delta)
        assertInvariant(s)
    }

    @Test
    fun recalculateKeepsBalanceAndTodaysSpending() {
        val start = Budget.applyTransaction(Budget.setUp(300f, oct10, payDay), expense(5f, oct10))
        val s = Budget.recalculate(start.copy(currentMonthFund = 445f), payDay)

        assertEquals(30f, s.moneyPerDay, delta) // (445 + 5) / 15
        assertEquals(25f, s.moneyForToday, delta)
        assertInvariant(s)
    }
}
