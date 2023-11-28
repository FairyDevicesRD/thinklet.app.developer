package com.example.fd.camera

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.video.VideoRecordEvent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.fd.camera.ui.theme.CameraRecorderTheme

class MainActivity : ComponentActivity(), VideoRecorder.IVideoRecorder {
    private companion object {
        const val TAG = "MainActivity"
    }

    private var videoRecorder: VideoRecorder? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CameraRecorderTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {}
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (!VideoRecorder.checkPermission(this)) {
            val m = "camera & recordAudio permission is not granted"
            Log.w(TAG, m)
            showMessage(m)
            return
        }
        videoRecorder = VideoRecorder(
            lifecycleOwner = this,
            context = this,
            listener = this
        ).apply {
            startRecording()
        }
    }

    override fun onPause() {
        videoRecorder?.stopRecording()
        super.onPause()
    }

    override fun onReceived(event: VideoRecordEvent) {
        when (event) {
            is VideoRecordEvent.Start -> {
                val m = "VideoRecordEvent.Start"
                Log.d(TAG, m)
                showMessage(m)
            }
            is VideoRecordEvent.Finalize -> Log.d(TAG, "VideoRecordEvent.Finalize")
        }
    }

    private fun showMessage(message: String) {
        runOnUiThread {
            Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
        }
    }
}
