package com.example.dailyfund_v2.Transaction

data class Transaction(
    var title: String,
    var amount: Float,
    var date: String
) : Comparable<Transaction> {
    override fun compareTo(other: Transaction): Int {
        val date1 = date.split(".").map { it.toInt() }
        val date2 = other.date.split(".").map { it.toInt() }

        return when {
            date1[2] < date2[2] -> 1
            date1[2] > date2[2] -> -1
            date1[1] < date2[1] -> 1
            date1[1] > date2[1] -> -1
            date1[0] < date2[0] -> 1
            date1[0] > date2[0] -> -1
            else -> 0
        }
    }
}
