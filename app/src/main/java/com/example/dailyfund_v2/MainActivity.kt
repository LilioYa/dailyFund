package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Helper.Companion.dateData
import com.example.dailyfund_v2.Helper.Companion.daysInTheMonth
import com.example.dailyfund_v2.Transaction.TransactionsActivity

class MainActivity : AppCompatActivity() {
    private lateinit var preferencesManager: PreferencesManager

    private lateinit var tvDailyFund: TextView
    private lateinit var tvMoneyPerDay: TextView
    private lateinit var tvBalance: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        preferencesManager = PreferencesManager(this)

        tvDailyFund = findViewById(R.id.tv_daily_fund)
        tvBalance = findViewById(R.id.tv_balance)
        tvMoneyPerDay = findViewById(R.id.tv_money_per_day)

        val currentDay = dateData("day")
        val currentMonth = dateData("month")

        var fromSettings = intent.getBooleanExtra("fromSettings", false)
        var fromTransactions = intent.getBooleanExtra("fromTransactions", false)

        // Update moneyPerDay if it's not set
        if(fromSettings && preferencesManager.moneyPerDay == Helper.NOT_SET_FLOAT){
            Helper.showToast(this, "Balance update too")
            updateMoneyPerDay()
            preferencesManager.balance = preferencesManager.moneyPerDay
            preferencesManager.previousMoneyForToday = preferencesManager.moneyPerDay
        }

        // Update currentMonthFund based on payDate
        if (currentDay == preferencesManager.payDate && currentMonth != preferencesManager.lastPayDateProcessedMonth) {
            preferencesManager.currentMonthFund += preferencesManager.salary - preferencesManager.desiredMonthlySavings
            preferencesManager.lastPayDateProcessedMonth = currentMonth
        }


        // Update moneyForToday ones per day
        if (preferencesManager.lastDayProcessed != currentDay || preferencesManager.moneyForToday == Helper.NOT_SET_FLOAT) {
//            Helper.showToast(this, "New day detected")
            preferencesManager.moneyForToday = preferencesManager.moneyPerDay
            preferencesManager.lastDayProcessed = currentDay
        }

        if (fromTransactions && preferencesManager.moneyForToday != Helper.NOT_SET_FLOAT && preferencesManager.previousMoneyForToday != preferencesManager.moneyForToday) {
            Helper.showToast(this, "Balance update")
            preferencesManager.balance += preferencesManager.moneyForToday - preferencesManager.previousMoneyForToday
            preferencesManager.previousMoneyForToday = preferencesManager.moneyForToday
        }

        updateValueDisplay()

        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_transactions).setOnClickListener { navigateToTransaction() }
        findViewById<Button>(R.id.btn_spread).setOnClickListener { if(preferencesManager.balance != 0f){spread()} }
        findViewById<Button>(R.id.btn_sort).setOnClickListener { sortBtn() }
    }

    private fun navigateToSettings() {
        val intent = Intent(this, SettingsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
            this,
            R.anim.animate_slide_right_enter,
            R.anim.animate_slide_right_exit
        )
        startActivity(intent, options.toBundle())
        finish()
    }

    private fun navigateToTransaction() {
        val intent = Intent(this, TransactionsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
            this,
            R.anim.animate_slide_left_enter,
            R.anim.animate_slide_left_exit
        )
        startActivity(intent, options.toBundle())
        finish()
    }

    private fun daysUntilPayDate(): Int {
        val daysLeft = when {
            preferencesManager.payDate == dateData("day") -> daysInTheMonth()
            dateData("day") > preferencesManager.payDate -> {
                val daysThisMonth = daysInTheMonth() - dateData("day")
                val daysNextMonth = preferencesManager.payDate
                daysThisMonth + daysNextMonth
            }
            else -> preferencesManager.payDate - dateData("day")
        }
        return daysLeft
    }


    private fun updateMoneyPerDay(){
        preferencesManager.moneyPerDay = preferencesManager.currentMonthFund / daysUntilPayDate()
        preferencesManager.previousMoneyForToday = preferencesManager.moneyForToday

    }

    private fun updateBalanceColor() {
        val balanceValue = preferencesManager.balance
        tvBalance.setTextColor(if (balanceValue < 0) getColor(R.color.red) else getColor(R.color.green))
    }

    private fun updateValueDisplay() {
        tvDailyFund.text = if(preferencesManager.moneyForToday == Helper.NOT_SET_FLOAT) "Set some values" else Helper.formatMoney(preferencesManager.moneyForToday)
        tvMoneyPerDay.text = "| : %s".format(Helper.formatMoney(preferencesManager.moneyPerDay))
        tvBalance.text = Helper.formatMoney(preferencesManager.balance)

        updateBalanceColor()
    }

    private fun spread(){
        if(preferencesManager.balance != 0f){
            val lastMoneyPerDay = preferencesManager.moneyPerDay
            updateMoneyPerDay()
            preferencesManager.moneyForToday +=  preferencesManager.moneyPerDay - lastMoneyPerDay

            preferencesManager.previousMoneyForToday = preferencesManager.moneyForToday
            preferencesManager.balance = 0f
            updateValueDisplay()
        }
        else{
            Helper.showToast(this, "You have nothing to spread.")
        }
    }

    private fun sortBtn() {
        Helper.showToast(this, "Coming soon")
    }
}
