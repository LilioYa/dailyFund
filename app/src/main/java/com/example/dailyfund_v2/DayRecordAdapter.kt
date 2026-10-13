package com.example.dailyfund_v2

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import java.time.LocalDate

class DayRecordAdapter(
        private val mContext: Context,
        private val mRecords: List<DayRecord>
) : BaseAdapter() {
    override fun getCount(): Int {
        return mRecords.size
    }

    override fun getItem(position: Int): DayRecord {
        return mRecords[position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        val inflater = mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val oneDayLine = convertView ?: inflater.inflate(R.layout.day_record_item, parent, false)

        val tvDate = oneDayLine.findViewById<TextView>(R.id.tv_day_date)
        val tvSpent = oneDayLine.findViewById<TextView>(R.id.tv_day_spent)
        val tvDiff = oneDayLine.findViewById<TextView>(R.id.tv_day_diff)

        val record = getItem(position)

        tvDate.text = Helper.formatDisplayDate(LocalDate.parse(record.date))
        tvSpent.text = "${Helper.formatMoney(record.spent)} / ${Helper.formatMoney(record.budget)}"
        tvDiff.text = Helper.formatMoney(record.diff)
        tvDiff.setTextColor(mContext.getColor(if (record.diff < 0) R.color.red else R.color.green))

        return oneDayLine
    }
}
