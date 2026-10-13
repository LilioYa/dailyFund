package com.example.dailyfund_v2.Transaction

import java.time.LocalDate

/** [amount] is signed: negative = expense, positive = income. [date] is ISO (yyyy-MM-dd). */
data class Transaction(
    var title: String,
    var amount: Float,
    var date: String
) : Comparable<Transaction> {
    val localDate: LocalDate get() = LocalDate.parse(date)

    /** Newest first. */
    override fun compareTo(other: Transaction): Int = other.localDate.compareTo(localDate)
}
