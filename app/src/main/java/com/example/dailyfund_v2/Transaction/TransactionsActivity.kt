package com.example.dailyfund_v2.Transaction

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ListView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Helper
import com.example.dailyfund_v2.MainActivity
import com.example.dailyfund_v2.PreferencesManager
import com.example.dailyfund_v2.R
import com.example.dailyfund_v2.SettingsActivity
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class TransactionsActivity : AppCompatActivity() {
    private lateinit var preferencesManager: PreferencesManager

    private lateinit var gson: Gson

    private lateinit var myTransactions : MyTransactions
    private lateinit var etTitle : EditText
    private lateinit var etAmount : EditText
    private lateinit var etDate : EditText
    private lateinit var lvTransactions : ListView

    private lateinit var adapter : TransactionAdapter

    private lateinit var preFillDate : String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_transactions)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        preferencesManager = PreferencesManager(this)
        gson = Gson()
        myTransactions = MyTransactions()

        etTitle = findViewById(R.id.et_title)
        etAmount = findViewById(R.id.et_amount)
        etDate = findViewById(R.id.et_date)
        lvTransactions = findViewById(R.id.lv_transactions)

        val day = if (Helper.dateData("day") < 10) "0${Helper.dateData("day")}" else Helper.dateData("day")
        val month = if (Helper.dateData("month") < 10) "0${Helper.dateData("month")}" else Helper.dateData("month")
        preFillDate = "${day}.${month}.${Helper.dateData("year").toString().takeLast(2)}"
        etDate.setText(preFillDate)

        val transactionsHistory: MutableList<Transaction> = gson.fromJson(
                preferencesManager.myTransactionsJson,
                object : TypeToken<MutableList<Transaction>>() {}.type
        )

        myTransactions.setMyTransactions(transactionsHistory.toMutableList())

        adapter = TransactionAdapter(this, myTransactions)
        lvTransactions.setAdapter(adapter)
        adapter.notifyDataSetChanged()

        val btnSettings = findViewById<ImageButton>(R.id.btn_settings)
        btnSettings.setOnClickListener{navigateToSettings()}

        val btnMain = findViewById<ImageButton>(R.id.btn_main)
        btnMain.setOnClickListener{navigateToMain()}

        val btnAddTransaction = findViewById<Button>(R.id.btn_add_transaction)
        btnAddTransaction.setOnClickListener{addTransaction(btnAddTransaction)}

        lvTransactions.setOnItemClickListener { parent, view, position, id ->
            showPopup(view, position)
        }
    }

    fun navigateToMain(){
        val intent = Intent(this, MainActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_right_enter,
                R.anim.animate_slide_right_exit
        )
        startActivity(intent, options.toBundle())
    }

    fun navigateToSettings(){
        val intent = Intent(this, SettingsActivity::class.java)
        val options = ActivityOptionsCompat.makeCustomAnimation(
                this,
                R.anim.animate_slide_right_enter,
                R.anim.animate_slide_right_exit
        )
        startActivity(intent, options.toBundle())
    }

    private fun addTransaction(view: View){
        if(etTitle.text.isEmpty() || etAmount.text.isEmpty() || etDate.text.isEmpty()){
            Helper.showToast(this, "Please fill all fields")
            return
        }
        if(!Helper.checkDateFormat(etDate.text.toString())){
            Helper.showToast(this, "Please enter a valid date")
            return
        }
        myTransactions.getMyTransactions().add(Transaction(etTitle.text.toString(), etAmount.text.toString().toFloat(), etDate.text.toString()))

        // Sort the list of transactions in descending order based on the date
        myTransactions.getMyTransactions().sort()

        adapter = TransactionAdapter(this, myTransactions)
        lvTransactions.setAdapter(adapter)
        adapter.notifyDataSetChanged()

        preferencesManager.currentMonthFund -= etAmount.text.toString().toFloat()
        preferencesManager.moneyForToday -= etAmount.text.toString().toFloat()

        // Save the updated list of transactions to SharedPreferences
        preferencesManager.myTransactionsJson = gson.toJson(myTransactions.getMyTransactions())

        etTitle.text.clear()
        etAmount.text.clear()
        etDate.text.clear()
        etDate.setText(preFillDate)
    }

    private fun showPopup(view: View, position: Int){
        val popupMenu = androidx.appcompat.widget.PopupMenu(this, view)
        popupMenu.inflate(R.menu.transaction_popup)

        popupMenu.setOnMenuItemClickListener{item ->
            when(item.itemId){
                R.id.item_edit -> {
                    Helper.showToast(this, "Edit")
                }
                R.id.item_delete -> {
                    preferencesManager.currentMonthFund += myTransactions.getMyTransactions()[position].amount
                    preferencesManager.moneyForToday += myTransactions.getMyTransactions()[position].amount
                    myTransactions.getMyTransactions().removeAt(position)
                    preferencesManager.myTransactionsJson = gson.toJson(myTransactions.getMyTransactions())
                    adapter.notifyDataSetChanged()
                }
            }
            false
        }
        popupMenu.show()
    }
}