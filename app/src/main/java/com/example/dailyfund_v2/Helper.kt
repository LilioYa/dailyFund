package com.example.dailyfund_v2

import android.content.Context
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.Date

class Helper {
    companion object {
        const val NOT_SET_FLOAT = -1.1111112f
        const val NOT_SET_INT = -1

        fun showToast(context: Context, text: String, duration: Int = Toast.LENGTH_SHORT) {
            Toast.makeText(context, text, duration).show()
        }

        fun saveData(
            activity: AppCompatActivity,
            component: TextView,
            value: Any,
            name: String
        ): Boolean {
            val sharedPreferences =
                activity.getSharedPreferences("com.example.dailyfund", Context.MODE_PRIVATE)
            val editor = sharedPreferences.edit()
            val componentTxt = component.text.toString()
            if (componentTxt.isEmpty()) {
                Toast.makeText(
                        activity,
                        "The \"${name.replace("_", " ")}\" box is empty, please fill it",
                        Toast.LENGTH_SHORT
                ).show()
            } else {
                when (value) {
                    is Int -> editor.putInt(name, componentTxt.toInt()).apply()
                    is Float -> editor.putFloat(name, componentTxt.toFloat()).apply()
                    is String -> editor.putString(name, componentTxt).apply()
                    is Boolean -> editor.putBoolean(name, componentTxt.toBoolean()).apply()
                    else -> return false
                }
                return true
            }
            return false
        }

        fun dateData(type: String): Int {
            val formatter = SimpleDateFormat("yyyy-MM-dd")
            val date = Date()
            val current = formatter.format(date)

            when (type) {
                "year" -> return current.substring(0, 4).toInt()
                "month" -> return current.substring(5, 7).toInt()
                "day" -> return current.substring(8, 10).toInt()
                else -> return 0
            }
        }

        fun daysInTheMonth(month: Int = dateData("month")): Int {
            val year = dateData("year")

            if (month == 2) {    //february
                if (year % 100 != 0 || year % 400 == 0) { //Leap year
                    return 29
                }
                return 28
            } else if (month % 2 == 0) {
                return if (month <= 6) 30 else 31
            } else if (month % 2 == 1) {
                return if (month <= 6) 31 else 30
            }
            return - 1
        }

        fun checkDateFormat(date: String):Boolean {
            val format = "dD.mM.yy"
            if (date.length != format.length) return false
            date.forEachIndexed { index, c ->
                when (format[index]) {
                    'd' -> if (c !in '0' .. '3') return false
                    'D' -> if (c !in '0' .. '9') return false
                    'm' -> if (c !in '0' .. '1') return false
                    'M' -> if (c !in '0' .. '9') return false
                    'y' -> if (c !in '0' .. '9') return false
                    '.' -> if (c != '.') return false
                }
            }
            return true
        }

        fun formatMoney(amount: Float): String {
            val formattedAmount = "%.2f".format(amount).replace(".", ",")
            return "$formattedAmount.-"
        }
    }
}