package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.ListView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Transaction.TransactionsActivity

class MainActivity : AppCompatActivity() {
    private lateinit var prefs: PreferencesManager
    private lateinit var tvDailyFund: TextView
    private lateinit var tvMoneyPerDay: TextView
    private lateinit var tvBalance: TextView
    private lateinit var lvHistory: ListView

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
        lvHistory = findViewById(R.id.lv_history)

        bindButtons()
    }

    override fun onResume() {
        super.onResume()
        // Done on resume so a day change while the app stays open is also closed
        updateDisplay(prefs.advanceBudgetToToday())
    }

    private fun bindButtons() {
        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_transactions).setOnClickListener { navigateToTransactions() }
        findViewById<Button>(R.id.btn_spread).setOnClickListener { spread() }
    }

    private fun navigateToSettings() {
        val intent = Intent(this, SettingsActivity::class.java)
        startActivity(intent, ActivityOptionsCompat.makeCustomAnimation(
            this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
        ).toBundle())
        finish()
    }

    private fun navigateToTransactions() {
        val intent = Intent(this, TransactionsActivity::class.java)
        startActivity(intent, ActivityOptionsCompat.makeCustomAnimation(
            this, R.anim.animate_slide_left_enter, R.anim.animate_slide_left_exit
        ).toBundle())
        finish()
    }

    private fun spread() {
        val state = prefs.advanceBudgetToToday()
        if (state.currentDay == null) {
            Helper.showToast(this, "Set up your budget in Settings first.")
        } else if (state.balance == 0f) {
            Helper.showToast(this, "Nothing to spread.")
        } else {
            val spread = Budget.spread(state, prefs.payDate)
            prefs.budgetState = spread
            updateDisplay(spread)
        }
    }

    private fun updateDisplay(state: BudgetState) {
        if (state.currentDay == null) {
            tvDailyFund.text = Helper.formatMoney(0f)
            tvMoneyPerDay.text = Helper.formatMoney(0f)
            tvBalance.text = Helper.formatMoney(0f)
            lvHistory.adapter = DayRecordAdapter(this, emptyList())
            return
        }
        tvDailyFund.text = Helper.formatMoney(state.moneyForToday)
        tvMoneyPerDay.text = Helper.formatMoney(state.moneyPerDay)
        tvBalance.text = Helper.formatMoney(state.balance)
        tvBalance.setTextColor(if (state.balance < 0) getColor(R.color.red) else getColor(R.color.green))
        lvHistory.adapter = DayRecordAdapter(this, state.history.reversed())
    }
}
