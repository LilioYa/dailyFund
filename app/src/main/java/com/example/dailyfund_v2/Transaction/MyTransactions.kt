package com.example.dailyfund_v2.Transaction

class MyTransactions(private var myTransactionsList: MutableList<Transaction> = mutableListOf()) {

    fun getMyTransactions(): MutableList<Transaction> {
        return myTransactionsList
    }

    fun setMyTransactions(myTransactionsList: MutableList<Transaction>) {
        this.myTransactionsList = myTransactionsList
    }
}