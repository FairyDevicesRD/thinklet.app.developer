package com.example.fd.camera

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.annotation.RequiresPermission
import androidx.camera.core.CameraSelector
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import java.io.File
import java.util.concurrent.Executors

/**
 * 録画・録音を行うクラス.
 * [lifecycleOwner]には，lifecycleRegistryで自作してもよいが，楽をするなら，実装済みのComponentActivityなどを指定する．
 * [context] には，Context． [listener] は，VideoRecorder の処理中イベントを受ける．省略可能．
 */
class VideoRecorder(
    private val lifecycleOwner: LifecycleOwner,
    private val context: Context,
    private val listener: IVideoRecorder? = null
) {
    companion object {
        private const val TAG = "VideoRecorder"

        /**
         * Permissionチェック
         * @param context Context
         * @return true == granted all permissions.
         */
        fun checkPermission(context: Context): Boolean {
            arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO).forEach {
                if (context.checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED) return false
            }
            return true
        }
    }

    /**
     * VideoRecorderのイベントインタフェース
     */
    fun interface IVideoRecorder {
        fun onReceived(event: VideoRecordEvent)
    }

    private val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

    // HD画質の動画を指定します．
    private val qualitySelector = QualitySelector.from(Quality.HD)

    // メインスレッドで処理をしないといけない処理があるときに使います．
    private val mainExecutor = ContextCompat.getMainExecutor(context)

    // メインスレッドじゃなくてよい処理に使用する別のスレッドです．
    private val recordExecutor = Executors.newSingleThreadExecutor()

    // 録画中のイベント操作インスタンスです．
    private var recording: Recording? = null

    /**
     * 録音開始
     */
    @RequiresPermission(allOf = [Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO])
    fun startRecording() {
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            configure(lifecycleOwner, cameraProvider)
        }, mainExecutor)
    }

    /**
     * 録音停止
     */
    fun stopRecording() {
        if (recording == null) {
            cameraProviderFuture.cancel(false)
        }
        recording?.stop()
        recording = null
    }

    @RequiresPermission(allOf = [Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO])
    private fun configure(
        lifecycleOwner: LifecycleOwner,
        cameraProvider: ProcessCameraProvider
    ) {
        // Recorderインスタンスを作成し，VideoCaptureインスタンスを作成します．
        val recorder = Recorder.Builder()
            .setExecutor(recordExecutor)
            .setQualitySelector(qualitySelector)
            .build()
        val videoCapture = VideoCapture.withOutput(recorder)

        // 念のために，rebindingする前に unbind しておきます．
        cameraProvider.unbindAll()
        try {
            cameraProvider.bindToLifecycle(
                lifecycleOwner,
                CameraSelector.DEFAULT_BACK_CAMERA,
                videoCapture
            )
        } catch (exc: Exception) {
            Log.e(TAG, "Use case binding failed", exc)
            return
        }

        // ファイル名を CameraX-recording-1111111111111.mp4 と設定します．
        val name = "CameraX-recording-${System.currentTimeMillis()}.mp4"
        // 書き込み先を /sdcard/Android/data/com.example.fd.camera/files/ 以下にします．
        val file = File(context.getExternalFilesDir(null), name)
        Log.d(TAG, "write to ${file.absolutePath}")

        val fileOutputOptions = FileOutputOptions.Builder(file)
            // ファイルの書き込み上限を 1G にします．
            .setFileSizeLimit((1.0 * 1000 * 1000 * 1000).toLong())
            .build()

        this.recording = videoCapture.output
            // ファイル書き込み先を指定
            .prepareRecording(context, fileOutputOptions)
            // 録音を有効化
            .withAudioEnabled()
            // 録画開始
            .start(recordExecutor) {
                // 定期的に録音中のイベントをコールバックします
                listener?.onReceived(it)
            }
    }
}
