package com.example.fd.multichannelaudiorecorder

import ai.fd.thinklet.sdk.audio.RawAudioRecordWrapper
import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.annotation.RequiresPermission
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date

/**
 * 5ch, 48000Hzのサンプリングレートで録音します．
 * 実際は，6chとなりますが，うち1つは空となります．
 */
class FiveChannelRecorder(private val context: Context) : RawAudioRecordWrapper.IRawAudioRecorder {
    companion object {
        private const val TAG = "FiveChannelRecorder"
        fun checkPermission(context: Context): Boolean {
            return context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        }
    }

    // 録音状態を管理する変数
    private var isRecording: Boolean = false
    // 簡易的に録音するためのクラス．6ch_48kで録音します．
    private val rawRecorder = RawAudioRecordWrapper()
    // 保存するファイル名
    private val dateFileName: String
        @SuppressLint("SimpleDateFormat")
        get() = "6ch_48kHz_${SimpleDateFormat("yyyy-MM-dd-hh-mm-ss").format(Date())}.raw"
    // 書き込みするファイルのStream．
    private val rawFileOutputStream: FileOutputStream
        get() = FileOutputStream(File(context.getExternalFilesDir(null), dateFileName))

    /**
     * 録音を開始します
     */
    @RequiresPermission(Manifest.permission.RECORD_AUDIO)
    fun startRecording() {
        if (isRecording) {
            Log.w(TAG, "already recording")
            return
        }
        if (!rawRecorder.prepare(context)) {
            Log.e(TAG, "Failed to prepare rawRecorder")
            return
        }
        rawRecorder.start(rawFileOutputStream, this)
        isRecording = true
    }

    /**
     * 録音を停止します
     */
    fun stopRecording() {
        if (isRecording) {
            rawRecorder.stop()
        }
        isRecording = false
    }

    override fun onReceivedPcmData(pcmData: ByteArray) {
        //Log.v(TAG, pcmData.size.toString())
    }

    override fun onFailed(throwable: Throwable) {
        Log.w(TAG, throwable.message.toString())
    }
}
