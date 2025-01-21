package com.example.dailyfund_v2.Transaction

import android.app.Activity
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import com.example.dailyfund_v2.R

class TransactionAdapter(
        private val mContext: Context,
        private val mTransactions: MyTransactions
) : BaseAdapter(){
    override fun getCount(): Int {
        return mTransactions.getMyTransactions().size
    }

    override fun getItem(position: Int): Transaction {
        return mTransactions.getMyTransactions()[position]
    }

    override fun getItemId(position: Int): Long {
        TODO("Not yet implemented")
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        val oneTransactionLine : View
        val inflater = mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        oneTransactionLine = inflater.inflate(R.layout.transaction_item, parent, false)

        val tvTitle = oneTransactionLine.findViewById<TextView>(R.id.tv_column_title)
        val tvAmount = oneTransactionLine.findViewById<TextView>(R.id.tv_column_amount)
        val tvDate = oneTransactionLine.findViewById<TextView>(R.id.tv_column_date)

        val transaction = getItem(position)

        tvTitle.text = transaction.title
        tvAmount.text = transaction.amount.toString()
        tvDate.text = transaction.date

        return oneTransactionLine
    }
}