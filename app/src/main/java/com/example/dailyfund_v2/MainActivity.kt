package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ListView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Helper
import com.example.dailyfund_v2.Helper.Companion.dateData
import com.example.dailyfund_v2.Helper.Companion.daysInTheMonth
import com.example.dailyfund_v2.Transaction.MyTransactions
import com.example.dailyfund_v2.Transaction.Transaction
import com.example.dailyfund_v2.Transaction.TransactionAdapter
import com.example.dailyfund_v2.Transaction.TransactionsActivity
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class MainActivity : AppCompatActivity() {
    private lateinit var prefs: PreferencesManager
    private lateinit var tvDailyFund: TextView
    private lateinit var tvMoneyPerDay: TextView
    private lateinit var tvBalance: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
        prefs = PreferencesManager(this)

        tvDailyFund = findViewById(R.id.tv_daily_fund)
        tvMoneyPerDay = findViewById(R.id.tv_money_per_day)
        tvBalance = findViewById(R.id.tv_balance)

        val today = dateData("day")
        val thisMonth = dateData("month")
        val fromSettings = intent.getBooleanExtra("fromSettings", false)
        val fromTransactions = intent.getBooleanExtra("fromTransactions", false)

        // 1. Jour de paie (une seule fois par mois)
        if (today == prefs.payDate && thisMonth != prefs.lastPayDateProcessedMonth) {
            prefs.currentMonthFund += prefs.salary - prefs.desiredMonthlySavings
            prefs.lastPayDateProcessedMonth = thisMonth
        }

        // 2. Fin de journée automatique si nouvelle journée détectée
        if (prefs.lastDayProcessed != today) {
            updateBalance()                       // Clôture de la veille
            prefs.moneyForToday = prefs.moneyPerDay
            prefs.lastDayProcessed = today
        }

        // 3. Initialisation après paramètres
        if (fromSettings && prefs.moneyPerDay == Helper.NOT_SET_FLOAT) {
            updateMoneyPerDay()
            prefs.balance = 0f                 // remise à zéro possible
            prefs.moneyForToday = prefs.moneyPerDay
            prefs.previousMoneyForToday = prefs.moneyForToday
        }

        // 4. Retour depuis Transactions : ajustement de balance en cours de journée
        if (fromTransactions && prefs.moneyForToday != Helper.NOT_SET_FLOAT) {
            val diff = prefs.previousMoneyForToday - prefs.moneyForToday
            if (diff != 0f) {
                prefs.balance += diff
                prefs.previousMoneyForToday = prefs.moneyForToday
            }
        }

        updateDisplay()
        bindButtons()
    }

    private fun bindButtons() {
        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_transactions).setOnClickListener { navigateToTransactions() }
        findViewById<Button>(R.id.btn_spread).setOnClickListener { spread() }
        findViewById<Button>(R.id.btn_sort).setOnClickListener { sortBtn() }
    }

    private fun navigateToSettings() {
        val intent = Intent(this, SettingsActivity::class.java)
        intent.putExtra("fromMain", true)
        startActivity(intent, ActivityOptionsCompat.makeCustomAnimation(
            this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
        ).toBundle())
        finish()
    }

    private fun navigateToTransactions() {
        val intent = Intent(this, TransactionsActivity::class.java)
        intent.putExtra("fromMain", true)
        startActivity(intent, ActivityOptionsCompat.makeCustomAnimation(
            this, R.anim.animate_slide_left_enter, R.anim.animate_slide_left_exit
        ).toBundle())
        finish()
    }

    private fun daysUntilPayday(): Int = when {
        prefs.payDate == dateData("day") -> daysInTheMonth()
        dateData("day") > prefs.payDate -> (daysInTheMonth() - dateData("day")) + prefs.payDate
        else -> prefs.payDate - dateData("day")
    }

    private fun updateMoneyPerDay() {
        prefs.moneyPerDay = prefs.currentMonthFund / daysUntilPayday()
    }

    private fun updateBalance() {
        val diff = prefs.moneyPerDay - prefs.moneyForToday
        prefs.balance += diff
    }

    private fun spread() {
        if (prefs.balance != 0f) {
            val old = prefs.moneyPerDay
            updateMoneyPerDay()
            prefs.moneyForToday += (prefs.moneyPerDay - old)
            prefs.previousMoneyForToday = prefs.moneyForToday
            prefs.balance = 0f
            updateDisplay()
        } else Helper.showToast(this, "Nothing to spread.")
    }

    private fun sortBtn() = Helper.showToast(this, "Coming soon")

    private fun updateDisplay() {
        tvDailyFund.text = Helper.formatMoney(prefs.moneyForToday)
        tvMoneyPerDay.text = Helper.formatMoney(prefs.moneyPerDay)
        tvBalance.text = Helper.formatMoney(prefs.balance)
        tvBalance.setTextColor(if (prefs.balance < 0) getColor(R.color.red) else getColor(R.color.green))
    }
}