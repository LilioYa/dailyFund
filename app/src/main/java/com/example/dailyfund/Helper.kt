package com.example.dailyfund

import android.content.Context
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class Helper {
    companion object {
        var isRefreshing:Boolean = false
        fun saveData(activity: AppCompatActivity, component: TextView, value:Any, name:String):Boolean{
            val sharedPreferences = activity.getSharedPreferences("com.example.dailyfund", Context.MODE_PRIVATE)
            val editor = sharedPreferences.edit()
            val componentTxt = component.text.toString()
            if (componentTxt.isEmpty()){
                Toast.makeText(activity, "The \"${name.replace("_", " ")}\" box is empty, please fill it", Toast.LENGTH_SHORT).show()
            } else {
                when(value) {
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
    }
}