package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

import com.example.dailyfund_v2.Helper.Companion.dateData
import com.example.dailyfund_v2.Helper.Companion.daysInTheMonth
import com.example.dailyfund_v2.Transaction.TransactionActivity

class MainActivity : AppCompatActivity() {
private lateinit var preferencesManager: PreferencesManager

private lateinit var tvDailyFund: TextView
private lateinit var tvBalance: TextView
private lateinit var tvCurrentMonthFund: TextView

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

        tvDailyFund = findViewById(R.id.tv_daily_fund_value)
        tvBalance = findViewById(R.id.tv_balance_value)
        tvCurrentMonthFund = findViewById(R.id.tv_month_fund_value)

        preferencesManager.currentMonthFund += if(dateData("day") == preferencesManager.paydayDate) preferencesManager.salary - preferencesManager.desiredMonthlySavings else 0f

        tvCurrentMonthFund.text = preferencesManager.currentMonthFund.toString()
        tvDailyFund.text = calculateCurrentMoney()

        val transactionButton = findViewById<Button>(R.id.btn_transaction)
        transactionButton.setOnClickListener{navigateToTransaction(transactionButton)}
    }

    fun navigateToSettings(view: View){
        startActivity(Intent(this, SettingsActivity::class.java).apply{finish()})
    }

    private fun navigateToTransaction(view: View){
        startActivity(Intent(this, TransactionActivity::class.java).apply{finish()})
    }

    private fun calculateCurrentMoney(): String {
        val daysLeft = when {
            preferencesManager.paydayDate == dateData("day") -> daysInTheMonth()
            dateData("day") > preferencesManager.paydayDate -> {
                val daysThisMonth = daysInTheMonth() - dateData("day")
                val daysNextMonth = preferencesManager.paydayDate
                daysThisMonth + daysNextMonth
            }
            else -> preferencesManager.paydayDate - dateData("day")
        }

        if (preferencesManager.currentMonthFund == -1f || preferencesManager.desiredMonthlySavings == -1f || preferencesManager.paydayDate == -1 || preferencesManager.salary == -1f) {
            return "Go in settings and apply"
        } else {
            val amountPerDay = preferencesManager.currentMonthFund / daysLeft
            val formattedAmount = "%.2f".format(amountPerDay).replace(".", ",")
            return "$formattedAmount.-"
        }
    }

}