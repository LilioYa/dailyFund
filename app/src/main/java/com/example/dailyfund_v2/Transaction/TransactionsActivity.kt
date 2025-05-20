// TransactionsActivity remains mostly the same but remove immediate balance update logic

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
    private lateinit var prefs: PreferencesManager
    private lateinit var gson: Gson
    private lateinit var myTransactions: MyTransactions
    private lateinit var etTitle: EditText
    private lateinit var etAmount: EditText
    private lateinit var etDate: EditText
    private lateinit var lv: ListView
    private lateinit var adapter: TransactionAdapter
    private lateinit var preFillDate: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_transactions)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
        prefs = PreferencesManager(this)
        gson = Gson()
        myTransactions = MyTransactions()

        etTitle = findViewById(R.id.et_title)
        etAmount = findViewById(R.id.et_amount)
        etDate = findViewById(R.id.et_date)
        lv = findViewById(R.id.lv_transactions)

        val dd = Helper.dateData("day").toString().padStart(2,'0')
        val mm = Helper.dateData("month").toString().padStart(2,'0')
        preFillDate = "${dd}.${mm}.${Helper.dateData("year").toString().takeLast(2)}"
        etDate.setText(preFillDate)

        val history: MutableList<Transaction> = gson.fromJson(
            prefs.myTransactionsJson,
            object : TypeToken<MutableList<Transaction>>() {}.type
        )
        myTransactions.setMyTransactions(history.toMutableList())
        adapter = TransactionAdapter(this, myTransactions)
        lv.adapter = adapter

        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_main).setOnClickListener { navigateToMain() }
        findViewById<Button>(R.id.btn_add_transaction).setOnClickListener { addTransaction() }
    }

    private fun navigateToMain() {
        startActivity(Intent(this, MainActivity::class.java)
            .putExtra("fromTransactions", true),
            ActivityOptionsCompat.makeCustomAnimation(
                this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
            ).toBundle())
        finish()
    }

    private fun navigateToSettings() {
        startActivity(Intent(this, SettingsActivity::class.java)
            .putExtra("fromTransactions", false),
            ActivityOptionsCompat.makeCustomAnimation(
                this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
            ).toBundle())
        finish()
    }

    private fun addTransaction() {
        if (etTitle.text.isEmpty() || etAmount.text.isEmpty() || etDate.text.isEmpty()) {
            Helper.showToast(this, "Please fill all fields")
            return
        }
        if (!Helper.checkDateFormat(etDate.text.toString())) {
            Helper.showToast(this, "Enter valid date")
            return
        }
        val tx = Transaction(etTitle.text.toString(), etAmount.text.toString().toFloat(), etDate.text.toString())
        myTransactions.getMyTransactions().add(tx)
        myTransactions.getMyTransactions().sort()
        adapter.notifyDataSetChanged()

        // Impact on totals
        prefs.currentMonthFund -= tx.amount
        if (etDate.text.toString().take(2).toInt() == Helper.dateData("day")) {
            prefs.moneyForToday -= tx.amount
        }
        prefs.myTransactionsJson = gson.toJson(myTransactions.getMyTransactions())

        // reset inputs
        etTitle.text.clear(); etAmount.text.clear(); etDate.setText(preFillDate)
    }

    // Handle delete and edit in popup:
    fun showPopup(view: View, position: Int) {
        val popup = androidx.appcompat.widget.PopupMenu(this, view)
        popup.inflate(R.menu.transaction_popup)
        popup.setOnMenuItemClickListener { item ->
            val tx = myTransactions.getMyTransactions()[position]
            when (item.itemId) {
                R.id.item_edit -> {
                    // implement edit dialog, update amount/date, then:
                    // prefs.currentMonthFund += old.amount; prefs.currentMonthFund -= new.amount
                    // same for moneyForToday if today
                    // update prefs.myTransactionsJson
                    adapter.notifyDataSetChanged()
                }
                R.id.item_delete -> {
                    prefs.currentMonthFund += tx.amount
                    if (tx.date.take(2).toInt() == Helper.dateData("day")) prefs.moneyForToday += tx.amount
                    myTransactions.getMyTransactions().removeAt(position)
                    prefs.myTransactionsJson = gson.toJson(myTransactions.getMyTransactions())
                    adapter.notifyDataSetChanged()
                }
            }
            false
        }
        popup.show()
    }
}
