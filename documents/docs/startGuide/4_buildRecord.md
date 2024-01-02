---
tags:
  - THINKLET
  - Android
  - Video Record
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {SampleVideoRecorderRoot, VideoRecorder} from '../_links.js'

# 録画アプリをつくってみる
開発環境の準備ができましたので、THINKLET向けに簡単な録画アプリを作ってみましょう。  
完成品は、<SampleVideoRecorderRoot /> にあります。  

## 新規アプリの作成
- Android Studioから新しいプロジェクトを作りましょう。
- アクティビティのテンプレートは、`Phone and Tablet` → `Empty Activity` で作成します。
  - お使いのAndroid Studioのバージョン次第で、作成するアプリのUIの記述方式が、異なる場合があります。
  - 具体的には、[developer.android.com #Jetpack Compose](https://developer.android.com/jetpack/compose/documentation?hl=ja)であったり、Android View（従来のxmlファイルにLayoutを記述する方式）です。今回はUIについてはほぼ触りません。従いまして、自動生成されたアクティビティさえあれば、どちらを使っていても大きな違いはありません。本ドキュメントでは `Jetpack Compose` のクラスを使いますが、適宜読み替えていただければ動作します。
- パッケージ名は任意です。本ドキュメントでは、`com.example.fd.camera` としています。
- MinimumSDK Versionには、`API 27: Android 8.1 (Oreo)` を選択します。

## CameraX 導入
- 手軽に録画アプリを実現するために、`CameraX` を使用します。使用するには、 `app/build.gradle` または `app/build.gradle.kts` に以下を追加します。
  <Tabs>
    <TabItem value="Groovy" label="Groovy(.gradle)">
    ```gradle
    dependencies {
        implementation 'androidx.core:core-ktx:1.8.0'
        implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.3.1'
        (中略)
    // highlight-start
    +   def cameraX = "1.2.3"
    +   implementation "androidx.camera:camera-video:$cameraX"
    +   implementation "androidx.camera:camera-lifecycle:$cameraX"
    +   implementation "androidx.camera:camera-camera2:$cameraX"
    // highlight-end
    ```
    </TabItem>
    <TabItem value="Kotlin" label="Kotlin(.gradle.kts)" default>
    ```gradle
    dependencies {
        implementation("androidx.core:core-ktx:1.8.0")
        implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.3.1")
        (中略)
    // highlight-start
    +   val cameraX = "1.2.3"
    +   implementation("androidx.camera:camera-video:$cameraX")
    +   implementation("androidx.camera:camera-lifecycle:$cameraX")
    +   implementation("androidx.camera:camera-camera2:$cameraX")
    // highlight-end
    ```
    </TabItem>
  </Tabs>
## Permission を設定
- カメラとマイクを使いますので、Permissionの宣言が必要となります。Permissionについては、[developer.android.com #permission](https://developer.android.com/guide/topics/permissions/overview?hl=ja) を確認ください。

- `app/src/main/AndroidManifest.xml` に以下を追加します。

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <manifest xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:tools="http://schemas.android.com/tools">

  // highlight-start
  +    <uses-permission android:name="android.permission.RECORD_AUDIO" />
  +    <uses-permission android:name="android.permission.CAMERA"/>
  +
  +    <uses-feature
  +        android:name="android.hardware.camera"
  +        android:required="false" />
  // highlight-end
  ```

## 録画クラスの実装
- `app/src/main/java/com/example/fd/camera/MainActivity.kt` と同じディレクトリに、  
`app/src/main/java/com/example/fd/camera/VideoRecorder.kt` を新規作成し、記述していきます。
- 記述する内容は、実装済みの <VideoRecorder /> をコピペしてください。
  - なお、パッケージ名を変えている場合や、CameraXのVersionが異なる場合は、適宜変更してください。
## 起動で録画開始、終了で録画終了
- `app/src/main/java/com/example/fd/camera/MainActivity.kt` が起動したら、  
録画を開始して、アプリが閉じられたら録画を停止するようにします。
- 必要最低限の実装としては以下になります。
  ```kotlin
  class MainActivity : ComponentActivity() {
  //highlight-next-line
  +    private var videoRecorder: VideoRecorder? = null

      // (中略)

  // highlight-start
  +   override fun onResume() {
  +       super.onResume()
  +       if (!VideoRecorder.checkPermission(this)) {
  +           return
  +       }
  +       videoRecorder = VideoRecorder(
  +           lifecycleOwner = this,
  +           context = this
  +       ).apply {
  +           startRecording()
  +       }
  +   }
  +
  +    override fun onPause() {
  +        videoRecorder?.stopRecording()
  +        super.onPause()
  +    }
  // highlight-end
  ```

:::info

`Activity`は、画面が起動した時に、`onResume()` が呼び出され、閉じる時に `onPause()` が呼び出しされます。
  注意：一般的なアプリ開発においては、2画面搭載のAndroidでは考え方が若干異なります。
ここでは、`onResume()` のタイミングで、Permissionが許可されているかを確認します。許可されていれば、VideoRecorderを作成し、録画を開始する `startRecording` 関数を呼び出しています。
また、アプリ終了時に、録画が停止されるように、`stopRecording`関数を`onPause()` 時に呼び出しています。  
さらに、`Activity`の関数から直接呼び出すのは推奨されていませんが、ここでは実装を簡略化するために利用しています。

:::

## デバッグ
- Android Studioからデバッグ実行して、THINKLETにこのアプリをインストールします。
  - ただし、初回デバッグ時は、Permissionを許可するような実装をしていませんので、何もできないアプリが起動するだけです。
- 次のコマンドでインストールしたアプリにPermissionを許可します。
  - scrcpyから画面操作し、Permissionを許可しても構いません。
  ```console
  # adb shell pm grant (パッケージ名) （許可するPermission名）
  // highlight-start
  $ adb shell pm grant com.example.fd.camera android.permission.RECORD_AUDIO
  $ adb shell pm grant com.example.fd.camera android.permission.CAMERA
  // highlight-end
  ```
- Android Studioからデバッグ実行をもう一度します。
- 20秒ほど放置し、THINKLETの電源ボタンを短押しして、画面をHomeに移動します。
  - scrcpy上でHomeに移動しても構いません。
- 以下のコマンドを実行してファイルが生成されているかを確認します。  
mp4ファイルが生成されていれば、録画ができています。
  ```console
  // highlight-next-line
  $ adb shell ls /sdcard/Android/data/com.example.fd.camera/files/
  CameraX-recording-1694083279133.mp4
  ```
## 再生
- 録画したファイルを取り出します。  
取り出すには次のコマンドを実行します。
  ```console
  // highlight-next-line
  $ adb pull /sdcard/Android/data/com.example.fd.camera/files/CameraX-recording-1694083279133.mp4 /path/to/save_dir/
  ```
- 視聴するには、汎用の再生ソフトを使用してください。

:::tip
うまくデバッグが実行できない、エラーが発生する等の場合は、「HelloWorldアプリをつくってみる」のチュートリアルや、  
サンプル実装と見比べてください。
また、JDKのVersionが古すぎる、Android SDK, Pathの設定に誤りがあるなどが考えられます。
:::
