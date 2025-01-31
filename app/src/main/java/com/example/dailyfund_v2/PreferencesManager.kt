package com.example.dailyfund_v2

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)

    private val editor: SharedPreferences.Editor
        get() = sharedPreferences.edit()

    // Properties to manage shared preferences
    var salary: Float
        get() = sharedPreferences.getFloat("salary", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("salary", value).apply()

    var desiredMonthlySavings: Float
        get() = sharedPreferences.getFloat("desiredMonthlySavings", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("desiredMonthlySavings", value).apply()

    var payDate: Int
        get() = sharedPreferences.getInt("payDate", Helper.NOT_SET_INT)
        set(value) = editor.putInt("payDate", value).apply()

    var lastPayDateProcessedMonth: Int
        get() = sharedPreferences.getInt("lastPayDateProcessedMonth", -1)
        set(value) = sharedPreferences.edit().putInt("lastPayDateProcessedMonth", value).apply()


    var currentMonthFund: Float
        get() = sharedPreferences.getFloat("currentMonthFund", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("currentMonthFund", value).apply()

    var myTransactionsJson: String
    get() = sharedPreferences.getString("myTransactions", "[]") ?: "[]"
    set(value) = editor.putString("myTransactions", value).apply()

    // Properties to manage balance system

    var balance: Float
        get() = sharedPreferences.getFloat("balance", 0f)
        set(value) = editor.putFloat("balance", value).apply()

    var moneyPerDay: Float
        get() = sharedPreferences.getFloat("moneyPerDay", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("moneyPerDay", value).apply()

    var moneyForToday: Float
        get() = sharedPreferences.getFloat("moneyForToday", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("moneyForToday", value).apply()

    var lastDayProcessed: Int
        get() = sharedPreferences.getInt("lastDayProcessed", -1)
        set(value) = editor.putInt("lastDayProcessed", value).apply()

}
