package com.example.dailyfund_v2.Transaction

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.ListView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.dailyfund_v2.Budget
import com.example.dailyfund_v2.BudgetState
import com.example.dailyfund_v2.Helper
import com.example.dailyfund_v2.MainActivity
import com.example.dailyfund_v2.PreferencesManager
import com.example.dailyfund_v2.R
import com.example.dailyfund_v2.SettingsActivity
import java.time.LocalDate

class TransactionsActivity : AppCompatActivity() {
    private lateinit var prefs: PreferencesManager
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
        myTransactions = MyTransactions(prefs.transactions)

        etTitle = findViewById(R.id.et_title)
        etAmount = findViewById(R.id.et_amount)
        etDate = findViewById(R.id.et_date)
        lv = findViewById(R.id.lv_transactions)

        preFillDate = Helper.formatDisplayDate(LocalDate.now())
        etDate.setText(preFillDate)

        adapter = TransactionAdapter(this, myTransactions)
        lv.adapter = adapter
        lv.setOnItemLongClickListener { _, view, position, _ ->
            showPopup(view, position)
            true
        }

        findViewById<ImageButton>(R.id.btn_settings).setOnClickListener { navigateToSettings() }
        findViewById<ImageButton>(R.id.btn_main).setOnClickListener { navigateToMain() }
        findViewById<Button>(R.id.btn_add_transaction).setOnClickListener { addTransaction() }
    }

    private fun navigateToMain() {
        startActivity(Intent(this, MainActivity::class.java),
            ActivityOptionsCompat.makeCustomAnimation(
                this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
            ).toBundle())
        finish()
    }

    private fun navigateToSettings() {
        startActivity(Intent(this, SettingsActivity::class.java),
            ActivityOptionsCompat.makeCustomAnimation(
                this, R.anim.animate_slide_right_enter, R.anim.animate_slide_right_exit
            ).toBundle())
        finish()
    }

    /** Returns the up-to-date budget, or null (with a message) if it isn't set up yet. */
    private fun currentBudget(): BudgetState? {
        val state = prefs.advanceBudgetToToday()
        if (state.currentDay == null) {
            Helper.showToast(this, "Set up your budget in Settings first")
            return null
        }
        return state
    }

    /** Validates the user input; shows a message and returns null if invalid. */
    private fun parseTransaction(title: String, amountText: String, dateText: String): Transaction? {
        val amount = amountText.toFloatOrNull()
        val date = Helper.parseDisplayDate(dateText)
        val error = when {
            title.isBlank() || amountText.isBlank() || dateText.isBlank() -> "Please fill all fields"
            amount == null || amount == 0f -> "Enter a valid amount (negative = expense, positive = income)"
            date == null -> "Enter a valid date (dd.mm.yy)"
            date.isAfter(LocalDate.now()) -> "Date can't be in the future"
            else -> null
        }
        if (error != null) {
            Helper.showToast(this, error)
            return null
        }
        return Transaction(title.trim(), amount!!, date!!.toString())
    }

    private fun saveTransactions() {
        myTransactions.getMyTransactions().sort()
        prefs.transactions = myTransactions.getMyTransactions()
        adapter.notifyDataSetChanged()
    }

    private fun addTransaction() {
        val state = currentBudget() ?: return
        val tx = parseTransaction(etTitle.text.toString(), etAmount.text.toString(), etDate.text.toString())
            ?: return

        prefs.budgetState = Budget.applyTransaction(state, tx)
        myTransactions.getMyTransactions().add(tx)
        saveTransactions()

        // reset inputs
        etTitle.text.clear(); etAmount.text.clear(); etDate.setText(preFillDate)
    }

    private fun showPopup(view: View, position: Int) {
        val popup = androidx.appcompat.widget.PopupMenu(this, view)
        popup.inflate(R.menu.transaction_popup)
        popup.setOnMenuItemClickListener { item ->
            val tx = myTransactions.getMyTransactions()[position]
            when (item.itemId) {
                R.id.item_edit -> showEditDialog(position, tx)
                R.id.item_delete -> deleteTransaction(position, tx)
            }
            true
        }
        popup.show()
    }

    private fun deleteTransaction(position: Int, tx: Transaction) {
        val state = currentBudget() ?: return
        prefs.budgetState = Budget.revertTransaction(state, tx)
        myTransactions.getMyTransactions().removeAt(position)
        saveTransactions()
    }

    private fun showEditDialog(position: Int, old: Transaction) {
        val etEditTitle = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_TEXT
            setText(old.title)
        }
        val etEditAmount = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL or
                    InputType.TYPE_NUMBER_FLAG_SIGNED
            setText(old.amount.toString())
        }
        val etEditDate = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_DATETIME or InputType.TYPE_DATETIME_VARIATION_DATE
            setText(Helper.formatDisplayDate(old.localDate))
        }
        val form = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 16, 48, 0)
            addView(etEditTitle)
            addView(etEditAmount)
            addView(etEditDate)
        }

        val dialog = AlertDialog.Builder(this)
            .setTitle(R.string.edit_transaction)
            .setView(form)
            .setPositiveButton(R.string.save, null)
            .setNegativeButton(R.string.cancel, null)
            .create()
        // Custom click handler so the dialog stays open when the input is invalid
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val state = currentBudget() ?: return@setOnClickListener
                val new = parseTransaction(
                    etEditTitle.text.toString(), etEditAmount.text.toString(), etEditDate.text.toString()
                ) ?: return@setOnClickListener

                prefs.budgetState = Budget.applyTransaction(Budget.revertTransaction(state, old), new)
                myTransactions.getMyTransactions()[position] = new
                saveTransactions()
                dialog.dismiss()
            }
        }
        dialog.show()
    }
}
