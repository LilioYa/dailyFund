package com.example.dailyfund_v2

import android.content.Context
import android.widget.Toast
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.time.format.ResolverStyle

class Helper {
    companion object {
        const val NOT_SET_FLOAT = -1.1111112f
        const val NOT_SET_INT = -1

        private val DISPLAY_DATE: DateTimeFormatter =
            DateTimeFormatter.ofPattern("dd.MM.uu").withResolverStyle(ResolverStyle.STRICT)

        fun showToast(context: Context, text: String, duration: Int = Toast.LENGTH_SHORT) {
            Toast.makeText(context, text, duration).show()
        }

        /** Parses a "dd.MM.yy" date typed by the user; null if invalid. */
        fun parseDisplayDate(text: String): LocalDate? =
            try {
                LocalDate.parse(text, DISPLAY_DATE)
            } catch (e: DateTimeParseException) {
                null
            }

        fun formatDisplayDate(date: LocalDate): String = date.format(DISPLAY_DATE)

        fun formatMoney(amount: Float): String {
            val formattedAmount = "%.2f".format(amount).replace(".", ",")
            return "$formattedAmount.-"
        }
    }
}
