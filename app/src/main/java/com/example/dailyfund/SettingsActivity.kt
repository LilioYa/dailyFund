package com.example.dailyfund

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {
    lateinit var salary : EditText
    lateinit var desiredSavings : EditText
    lateinit var paydayDate : EditText
    lateinit var currentMonthFund : EditText


    lateinit var sharedPreferences: SharedPreferences

    var salarySave : Float? = null
    var desiredSavingsSave : Float? = null
    var paydayDateSave : Int? = null
    var currentMonthFundSave : Float? = null


    var isValueValid : Boolean = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        //definition of components
        salary = findViewById(R.id.salaryInput)
        desiredSavings = findViewById(R.id.desiredSavingsInput)
        paydayDate = findViewById(R.id.paydayDateInput)
        currentMonthFund = findViewById(R.id.currentMonthFundInput)


        //storage
        sharedPreferences = this.getSharedPreferences("com.example.dailyfund", Context.MODE_PRIVATE)

        salarySave = sharedPreferences.getFloat("salary", -1f)
        desiredSavingsSave = sharedPreferences.getFloat("desired_savings", -1f)
        paydayDateSave = sharedPreferences.getInt("payday_date", -1)
        currentMonthFundSave = intent.getFloatExtra("current_month_fund", sharedPreferences.getFloat("current_month_fund", -1f))

        //apply save values
        salary.setText(if (salarySave == -1f) "" else salarySave.toString())
        desiredSavings.setText(if (desiredSavingsSave == -1f) "" else desiredSavingsSave.toString())
        paydayDate.setText(if (paydayDateSave == -1) "" else paydayDateSave.toString())
        currentMonthFund.setText(if (currentMonthFundSave == -1f) "" else currentMonthFundSave.toString())

        if (Helper.isRefreshing){
            Helper.isRefreshing = false
            saveValue()
        }
        val applyButton = findViewById<Button>(R.id.buttonApply)
        applyButton.setOnClickListener {saveValue()}
    }

    fun goToMain(view: View) {
        val intentToMainActivity = Intent(this, MainActivity::class.java)
        intentToMainActivity.putExtra("salary", salarySave)
        intentToMainActivity.putExtra("desired_savings_save", desiredSavingsSave)
        intentToMainActivity.putExtra("payday_date_save", paydayDateSave)
        intentToMainActivity.putExtra("current_month_fund", currentMonthFundSave)
        startActivity(intentToMainActivity)
    }

    private fun saveValue() {
        isValueValid = Helper.saveData(this, salary, 0f, "salary")
                && Helper.saveData(this, desiredSavings, 0f, "desired_savings")
                && Helper.saveData(this, paydayDate, 0, "payday_date")
                && Helper.saveData(this, currentMonthFund, 0f, "current_month_fund")

        if(isValueValid){
            Toast.makeText(this, "Changes applied", Toast.LENGTH_SHORT).show()
            goToMain(salary)
        }
    }
}