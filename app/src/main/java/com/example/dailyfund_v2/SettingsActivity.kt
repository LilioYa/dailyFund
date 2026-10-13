package com.example.dailyfund_v2

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Transaction.TransactionsActivity
import java.time.LocalDate

class SettingsActivity : AppCompatActivity() {
    private lateinit var preferencesManager: PreferencesManager

    private lateinit var etSalary: EditText
    private lateinit var etDesiredMonthlySavings: EditText
    private lateinit var etPayDate: EditText
    private lateinit var etCurrentMonthFund: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_settings)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        preferencesManager = PreferencesManager(this)

        etSalary = findViewById(R.id.et_salary)
        etDesiredMonthlySavings = findViewById(R.id.et_desired_monthly_savings)
        etPayDate = findViewById(R.id.et_pay_date)
        etCurrentMonthFund = findViewById(R.id.et_current_month_fund)

        val salary = if (preferencesManager.salary == Helper.NOT_SET_FLOAT) "" else preferencesManager.salary.toString()
        etSalary.setText(salary)

        val desiredMonthlySavings = if (preferencesManager.desiredMonthlySavings == Helper.NOT_SET_FLOAT) "" else preferencesManager.desiredMonthlySavings.toString()
        etDesiredMonthlySavings.setText(desiredMonthlySavings)

        val payDate = if (preferencesManager.payDate == Helper.NOT_SET_INT) "" else preferencesManager.payDate.toString()
        etPayDate.setText(payDate)

        val state = preferencesManager.advanceBudgetToToday()
        val currentMonthFund = if (state.currentDay == null) "" else state.currentMonthFund.toString()
        etCurrentMonthFund.setText(currentMonthFund)

        val btnMain = findViewById<ImageButton>(R.id.btn_main)
        btnMain.setOnClickListener{navigateToMain()}

        val btnTransactions = findViewById<ImageButton>(R.id.btn_transactions)
        btnTransactions.setOnClickListener{navigateToTransaction()}

        val btnApply = findViewById<Button>(R.id.btn_apply)
        btnApply.setOnClickListener{saveValue()}
    }


    private fun navigateToMain(){
        val intent = Intent(this, MainActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_left_enter,
                R.anim.animate_slide_left_exit
        )
        startActivity(intent, options.toBundle())

        finish()
    }

    fun navigateToTransaction(){
        val intent = Intent(this, TransactionsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_left_enter,
                R.anim.animate_slide_left_exit
        )
        startActivity(intent, options.toBundle())
        finish()
    }


    private fun saveValue() {
        val salary = etSalary.text.toString().toFloatOrNull()
        val desiredMonthlySavings = etDesiredMonthlySavings.text.toString().toFloatOrNull()
        val payDate = etPayDate.text.toString().toIntOrNull()
        val currentMonthFund = etCurrentMonthFund.text.toString().toFloatOrNull()

        if (salary == null || desiredMonthlySavings == null || payDate == null || currentMonthFund == null) {
            Helper.showToast(this, "Please fill all fields with valid numbers")
            return
        }
        if (payDate !in 1..31) {
            Helper.showToast(this, "Pay date must be a day between 1 and 31")
            return
        }

        // Close elapsed days with the old settings before applying the new ones
        val state = preferencesManager.advanceBudgetToToday()
        preferencesManager.salary = salary
        preferencesManager.desiredMonthlySavings = desiredMonthlySavings
        preferencesManager.payDate = payDate
        preferencesManager.budgetState = if (state.currentDay == null) {
            Budget.setUp(currentMonthFund, LocalDate.now(), payDate)
        } else {
            Budget.recalculate(state.copy(currentMonthFund = currentMonthFund), payDate)
        }
        Helper.showToast(this, "Changes applied")
        navigateToMain()
    }
}
