package com.example.dailyfund_v2

import android.content.Context
import android.content.SharedPreferences
import com.example.dailyfund_v2.Transaction.Transaction
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate

class PreferencesManager(context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)

    private val editor: SharedPreferences.Editor
        get() = sharedPreferences.edit()

    private val gson = Gson()

    // Settings

    var salary: Float
        get() = sharedPreferences.getFloat("salary", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("salary", value).apply()

    var desiredMonthlySavings: Float
        get() = sharedPreferences.getFloat("desiredMonthlySavings", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("desiredMonthlySavings", value).apply()

    var payDate: Int
        get() = sharedPreferences.getInt("payDate", Helper.NOT_SET_INT)
        set(value) = editor.putInt("payDate", value).apply()

    val budgetSettings: BudgetSettings
        get() = BudgetSettings(salary, desiredMonthlySavings, payDate)

    // Transactions (new key: older versions stored unsigned amounts and dd.MM.yy dates under "myTransactions")

    var transactions: MutableList<Transaction>
        get() = gson.fromJson(
            sharedPreferences.getString("transactions", "[]"),
            object : TypeToken<MutableList<Transaction>>() {}.type
        )
        set(value) = editor.putString("transactions", gson.toJson(value)).apply()

    // Balance system

    var budgetState: BudgetState
        get() = BudgetState(
            currentMonthFund = sharedPreferences.getFloat("currentMonthFund", Helper.NOT_SET_FLOAT),
            moneyPerDay = sharedPreferences.getFloat("moneyPerDay", 0f),
            moneyForToday = sharedPreferences.getFloat("moneyForToday", 0f),
            balance = sharedPreferences.getFloat("balance", 0f),
            // New key: older versions stored the day of month as an Int under "lastDayProcessed"
            currentDay = sharedPreferences.getString("currentDay", null)?.let(LocalDate::parse),
            history = gson.fromJson(
                sharedPreferences.getString("history", "[]"),
                object : TypeToken<List<DayRecord>>() {}.type
            )
        )
        set(value) = editor
            .putFloat("currentMonthFund", value.currentMonthFund)
            .putFloat("moneyPerDay", value.moneyPerDay)
            .putFloat("moneyForToday", value.moneyForToday)
            .putFloat("balance", value.balance)
            .putString("currentDay", value.currentDay?.toString())
            .putString("history", gson.toJson(value.history))
            .apply()

    /** Closes the days elapsed since the last launch. Call before reading or changing the budget. */
    fun advanceBudgetToToday(): BudgetState {
        val state = Budget.advanceTo(budgetState, LocalDate.now(), budgetSettings)
        budgetState = state
        return state
    }
}
