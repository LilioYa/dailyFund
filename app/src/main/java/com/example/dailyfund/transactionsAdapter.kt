package com.example.dailyfund

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView

class transactionsAdapter(
    var mContext: Context,
    var resource: Int,
    var values: ArrayList<String>
): ArrayAdapter<String>(mContext, resource, values) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {

        val transaction = values[position]
        val itemView = LayoutInflater.from(mContext).inflate(resource, parent, false)
        val tvTitle = itemView.findViewById<TextView>(R.id.tvTitle)
        tvTitle.text = transaction
        val tvDate = itemView.findViewById<TextView>(R.id.tvDate)
        val tvPrice = itemView.findViewById<TextView>(R.id.tvPrice)

        return super.getView(position, convertView, parent)
    }

}