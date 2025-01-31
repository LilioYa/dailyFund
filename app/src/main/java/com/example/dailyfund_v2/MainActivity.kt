package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.view.View
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

        val currentDay = dateData("day")
        val currentMonth = dateData("month")

        // Mise à jour du solde mensuel le jour de paie (une seule fois par mois)
        if (currentDay == preferencesManager.payDate && currentMonth != preferencesManager.lastPayDateProcessedMonth) {
            preferencesManager.currentMonthFund += preferencesManager.salary - preferencesManager.desiredMonthlySavings
            updateMoneyPerDay()
            preferencesManager.lastPayDateProcessedMonth = currentMonth
        }

        // Mise à jour de l'argent quotidien en début de journée
        if (currentDay != preferencesManager.lastDayProcessed) {
            preferencesManager.moneyForToday = preferencesManager.moneyPerDay
            preferencesManager.lastDayProcessed = currentDay
        }

        updateBalance()

        // Mise à jour de l'affichage
        tvDailyFund.text = Helper.formatMoney(preferencesManager.moneyForToday)
        tvBalance.text = Helper.formatMoney(preferencesManager.balance)

        // Gestion des boutons
        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_transactions).setOnClickListener { navigateToTransaction() }
        findViewById<Button>(R.id.btn_spread).setOnClickListener { spread() }
        findViewById<Button>(R.id.btn_sort).setOnClickListener { sortBtn() }
    }

    private fun updateMoneyPerDay(){
        preferencesManager.moneyPerDay = preferencesManager.currentMonthFund / daysUntilPayDate()
    }

    private fun updateBalance() {
        val difference = preferencesManager.moneyForToday - preferencesManager.moneyPerDay
        preferencesManager.balance += difference
        updateBalanceColor()
    }

    private fun updateBalanceColor() {
        val balanceValue = preferencesManager.balance
        tvBalance.setTextColor(
                if (balanceValue < 0) getColor(R.color.red) else getColor(R.color.green)
        )
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

    private fun navigateToSettings() {
        val intent = Intent(this, SettingsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_right_enter,
                R.anim.animate_slide_right_exit
        )
        startActivity(intent, options.toBundle())
    }

    private fun navigateToTransaction() {
        val intent = Intent(this, TransactionsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_left_enter,
                R.anim.animate_slide_left_exit
        )
        startActivity(intent, options.toBundle())
    }

    private fun spread(){
        val lastMoneyPerDay = preferencesManager.moneyPerDay
        val lastMoneyForToday = preferencesManager.moneyForToday
        updateMoneyPerDay()
        preferencesManager.moneyForToday +=  lastMoneyPerDay - lastMoneyForToday
        updateBalance()
        tvDailyFund.text = Helper.formatMoney(preferencesManager.moneyForToday)
        tvBalance.text = Helper.formatMoney(preferencesManager.balance)
    }

    private fun sortBtn() {
        Helper.showToast(this, "Coming soon")
    }
}
