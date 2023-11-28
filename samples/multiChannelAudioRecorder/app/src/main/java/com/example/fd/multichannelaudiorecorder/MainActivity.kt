package com.example.fd.multichannelaudiorecorder

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.fd.multichannelaudiorecorder.ui.theme.MultiChannelAudioRecorderTheme

class MainActivity : ComponentActivity() {
    private var fiveChannelRecorder: FiveChannelRecorder? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MultiChannelAudioRecorderTheme {}
        }
    }

    override fun onResume() {
        super.onResume()
        if (!FiveChannelRecorder.checkPermission(this)) {
            val m = "recordAudio permission is not granted"
            Log.w(TAG, m)
            showMessage(m)
            return
        }
        fiveChannelRecorder = FiveChannelRecorder(this).apply {
            startRecording()
        }
    }

    override fun onPause() {
        fiveChannelRecorder?.stopRecording()
        fiveChannelRecorder = null
        super.onPause()
    }

    private fun showMessage(message: String) {
        runOnUiThread {
            Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
        }
    }

    private companion object {
        const val TAG = "MainActivity"
    }
}
