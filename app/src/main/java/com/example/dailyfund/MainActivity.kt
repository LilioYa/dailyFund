package com.example.dailyfund

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

import com.example.dailyfund.Helper.Companion.dateData
import com.example.dailyfund.Helper.Companion.daysInTheMonth


class MainActivity : AppCompatActivity() {
    lateinit var currentMoney: TextView
    lateinit var tvCurrentMonthFund: TextView

    var salary: Float = -1f
    var currentMonthFund = -1f
    var desiredSavings: Float = -1f
    var paydayDate: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        salary = intent.getFloatExtra("salary", -1f)
        desiredSavings = intent.getFloatExtra("desired_savings_save", -1f)
        paydayDate = intent.getIntExtra("payday_date_save", -1)
        currentMonthFund = intent.getFloatExtra("current_month_fund", -1f)

        //update currentMonthFund
        currentMonthFund = if(dateData("day") == paydayDate) salary - desiredSavings else currentMonthFund

        //Always display in the end of the onCreate()
        currentMoney = findViewById(R.id.tvMoneyForToday)
        currentMoney.text = calculateCurrentMoney()

        tvCurrentMonthFund = findViewById(R.id.textValueCurrentMonthFund)
        tvCurrentMonthFund.text = currentMonthFund.toString()


        val goTransactionsBtn = findViewById<Button>(R.id.buttonGoToTransaction)
        goTransactionsBtn.setOnClickListener{
            goToTransactions(goTransactionsBtn)
        }
    }

    fun goToSettings(view: View){
        val intentToSettingsActivity = Intent(this, SettingsActivity::class.java)
        if (currentMonthFund != -1f){
            intentToSettingsActivity.putExtra("current_month_fund", currentMonthFund)
        }
        startActivity(intentToSettingsActivity)
    }

    fun goToTransactions(view: View){
        val intentToTransactionsActivity = Intent(this, TransactionsActivity::class.java)
        startActivity(intentToTransactionsActivity)
    }

    fun refresh(view: View){
        Helper.isRefreshing = true
        Toast.makeText(this, "Refreshing...", Toast.LENGTH_SHORT).show()
        goToSettings(currentMoney)
    }

    private fun calculateCurrentMoney():String{
        val daysLeft = if(paydayDate == dateData("day")) daysInTheMonth()
                        else if (dateData("day") > paydayDate) daysInTheMonth(dateData("Month")+1) - paydayDate + dateData("day") - daysInTheMonth()
                        else paydayDate - dateData("day")
        if(currentMonthFund == -1f || desiredSavings == -1f || paydayDate == -1 || salary == -1f){
            return "Go in settings and apply"
        }else{
            val amountPerDay = currentMonthFund / daysLeft
            val formattedAmount = "%.2f".format(amountPerDay).replace(".", ",")
            return "$formattedAmount.-"
        }
    }
}