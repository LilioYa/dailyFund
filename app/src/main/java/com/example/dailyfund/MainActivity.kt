package com.example.dailyfund

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.text.SimpleDateFormat
import java.util.Date

class MainActivity : AppCompatActivity() {
    lateinit var currentMoney: TextView
    var salary: Float = -1f
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

        currentMoney = findViewById(R.id.textCurMonValue)
        currentMoney.text = calculateCurrentMoney()
    }

    fun goToSettings(view: View){
        val intentToSettingsActivity = Intent(this, SettingsActivity::class.java)
        startActivity(intentToSettingsActivity)
    }

    fun refresh(view: View){
        Helper.isRefreshing = true
        Toast.makeText(this, "Refreshing...", Toast.LENGTH_SHORT).show()
        goToSettings(currentMoney)
    }

    private fun daysLeft(endDate:Int = 0):Int{
        val formatter = SimpleDateFormat("yyyy-MM-dd")
        val date = Date()
        val current = formatter.format(date)

        val day = current.substring(8, 10).toInt()

        if(endDate != 0){
            return endDate - day + 1
        }else{
            val year = current.substring(0,4).toInt()
            val month = current.substring(5, 7).toInt()

            var maxDay = 31
            if (month == 2){    //february
                maxDay = 28
                if (year % 100 != 0 || year % 400 == 0){ //Leap year
                    maxDay = 29
                }
            }else if (month % 2 == 0){
                maxDay = if(month <= 6) 30 else 31
            }else if (month % 2 == 1) {
                maxDay = if (month <= 6) 31 else 30
            }
            return maxDay - day + 1
        }
    }

    private fun calculateCurrentMoney():String{
        if(salary == -1f || desiredSavings == -1f || paydayDate == -1){
            return "Go in settings and apply"
        }else{
            val amountPerDay = (salary - desiredSavings) / daysLeft(paydayDate)
            val formattedAmount = "%.2f".format(amountPerDay).replace(".", ",")
            return "$formattedAmount.-"

        }
    }
}