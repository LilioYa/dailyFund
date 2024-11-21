package com.example.dailyfund

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity

class TransactionsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transactions)

        val transactionList = findViewById<ListView>(R.id.ListTransactions)
        val postsArray = arrayListOf("1","2","3","4","5")
        val adapter = transactionsAdapter(this, R.layout.item_transaction, postsArray)
        transactionList.adapter = adapter

    }

    fun goToMain(view: View) {
        val intentToMainActivity = Intent(this, MainActivity::class.java)
        startActivity(intentToMainActivity)
    }
}