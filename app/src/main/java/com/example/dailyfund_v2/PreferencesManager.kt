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
        get() = sharedPreferences.getFloat("desiredSavings", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("desiredSavings", value).apply()

    var paydayDate: Int
        get() = sharedPreferences.getInt("paydayDate", Helper.NOT_SET_INT)
        set(value) = editor.putInt("paydayDate", value).apply()

    var currentMonthFund: Float
        get() = sharedPreferences.getFloat("currentMonthFund", Helper.NOT_SET_FLOAT)
        set(value) = editor.putFloat("currentMonthFund", value).apply()

    var myTransactionsJson: String
    get() = sharedPreferences.getString("myTransactions", "[]") ?: "[]"
    set(value) = editor.putString("myTransactions", value).apply()
}
