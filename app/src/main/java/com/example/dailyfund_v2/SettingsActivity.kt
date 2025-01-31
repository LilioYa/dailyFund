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

class SettingsActivity : AppCompatActivity() {
    private lateinit var preferencesManager: PreferencesManager

    private lateinit var etSalary: EditText
    private lateinit var etDesiredMonthlySavings: EditText
    private lateinit var etPaydayDate: EditText
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
        etPaydayDate = findViewById(R.id.et_payday_date)
        etCurrentMonthFund = findViewById(R.id.et_current_month_fund)

        etSalary.setText(preferencesManager.salary.toString())
        etDesiredMonthlySavings.setText(preferencesManager.desiredMonthlySavings.toString())
        etPaydayDate.setText(preferencesManager.paydayDate.toString())
        etCurrentMonthFund.setText(preferencesManager.currentMonthFund.toString())

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
    }

    fun navigateToTransaction(){
        val intent = Intent(this, TransactionsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_left_enter,
                R.anim.animate_slide_left_exit
        )
        startActivity(intent, options.toBundle())
    }


    private fun saveValue() {
        var isValueValid = Helper.saveData(this, etSalary, 0f, "salary")
                && Helper.saveData(this, etDesiredMonthlySavings, 0f, "desired_monthly_savings")
                && Helper.saveData(this, etPaydayDate, 0, "payday_date")
                && Helper.saveData(this, etCurrentMonthFund, 0f, "current_month_fund")

        if (isValueValid) {
            preferencesManager.salary = etSalary.text.toString().toFloat()
            preferencesManager.desiredMonthlySavings = etDesiredMonthlySavings.text.toString().toFloat()
            preferencesManager.paydayDate = etPaydayDate.text.toString().toInt()
            preferencesManager.currentMonthFund = etCurrentMonthFund.text.toString().toFloat()
            Helper.showToast(this, "Changes applied")
            navigateToMain()
        }
    }
}