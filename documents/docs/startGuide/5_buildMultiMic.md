---
tags:
  - THINKLET
  - Android
  - THINKLET App SDK
  - Record Audio
---

import {SampleMultiAudioRecorderRoot, FiveChannelRecorder} from '../_links.js'

# マルチマイクで録音するアプリをつくってみる
THINKLET固有の機能を用いて、簡単な録音アプリを作ってみましょう。  
完成品は、<SampleMultiAudioRecorderRoot /> にあります。
## 新規アプリの作成
- Android Studioから新しいプロジェクトを作りましょう。前項の録画アプリと手順は同じです。
- アクティビティのテンプレートは、`Phone and Tablet` → `Empty Activity` で作成、パッケージ名は任意です。本ドキュメントでは、`com.example.fd.multichannelaudiorecorder` としています。
- こちらも、MinimumSDK Versionには、`API 27: Android 8.1 (Oreo)` を選択します。
## THINKLET App SDK の導入
- THINKLETの開発には、デバイス固有の機能にアクセスするための機能として、[THINKLET App SDK](https://github.com/FairyDevicesRD/thinklet.app.sdk) を [Github Packages](https://github.co.jp/features/packages) で提供しています。
- マルチマイクを扱うには、THINKLET App SDKを使うことが最も容易です。
- ここでは、その設定をします。
### Github 個人用アクセストークン発行
- THINKLET App SDKには、Githubアカウントが必須です。アカウントを持っていない方は、[Github](https://docs.github.com/ja/get-started/signing-up-for-github/signing-up-for-a-new-github-account) よりアカウントを作成して下さい。
- [個人用アクセス トークン](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-token-classic-%E3%81%AE%E4%BD%9C%E6%88%90) に従い、アクセストークン（以下、トークン）を発行します。トークンのスコープには、`read:packages` が必要です。
  - トークンは、パスワードと同様の扱いとしてください。
  - GithubPackagesについては、[こちら](https://docs.github.com/ja/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries) も参照ください。
### アクセストークンを設定
- 発行したトークンなどを、作成した `com.example.fd.multichannelaudiorecorder`（または任意のプロジェクト名）に設定していきます。
- プロジェクト直下の `settings.gradle` ファイルに以下を追記します。これにより、ビルドシステムが必要なライブラリを見つけられるようになります。
  ```gradle
  dependencyResolutionManagement {
      repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
      repositories {
          google()
          mavenCentral()
  +       maven {
  +           name = "GitHubPackages"
  +           url = uri("https://maven.pkg.github.com/FairyDevicesRD/thinklet.app.sdk")
  +           credentials {
  +               Properties properties = new Properties()
  +               properties.load(file('github.properties').newDataInputStream())
  +               username = properties.getProperty("username") ?: ""
  +               password = properties.getProperty("token") ?: ""
  +           }
          }
      }
  }
  rootProject.name = "MultiChannelAudioRecorder"
  include ':app'
  ```
- 次に、`settings.gradle` があるプロジェクト直下で、 `github.properties` ファイルを新規作成し、以下のように追記します。
  ```gradle
  + username=あなたの Github username
  + token=発行したトークン
  ```
- 次に、`app/build.gradle` ファイルに以下を追記します。
  ```gradle
  dependencies {

    implementation 'androidx.core:core-ktx:1.8.0'
    (中略)
    implementation 'androidx.compose.material3:material3'

  + implementation 'ai.fd.thinklet:sdk-audio:0.0.4'
  ```
- 最後に、Android Studioを操作します。
  - 画面上部に表示されている `Sync Now` をクリックします。
  ![sync](./img/studio/sync.jpg)
  - Syncすることで、THINKLET App SDKの `sdk-audio` をローカルに取得し、機能を利用できるようになります。
  - この時点で、エラーなどが発生する場合は、Githubトークンの情報に誤りがある、ビルドマシンがオフラインなどの可能性があります。
## Permission について
- 今回利用する `ai.fd.thinklet:sdk-audio` にはすでに、`android.permission.RECORD_AUDIO` が宣言されています。AndroidManifestへの個別の記載は不要です。

:::tip

Android向けのライブラリである`AAR`には、`AndroidManifest.xml`が組み込まれています。これにより、ライブラリを利用したいアプリにPermissionなどの情報を追加できます。  
例えば、`android.permission.INTERNET` を宣言していないのに通信ができるときは、依存ライブラリですでに宣言していたりします。  
依存ライブラリを使用することで、どのようなAndroidManifestになるかについては、Android Studioの「Merged Manifest」から確認ができます。
詳しくは、 [developer.android.com #manifest-merge](https://developer.android.com/studio/build/manifest-merge?hl=ja) をご参照ください。

:::

## マルチマイク録音クラスの実装
- `samples/multiChannelAudioRecorder/app/src/main/java/com/example/fd/multichannelaudiorecorder/MainActivity.kt` と同じディレクトリに、  
`samples/multiChannelAudioRecorder/app/src/main/java/com/example/fd/multichannelaudiorecorder/FiveChannelRecorder.kt` を作成し、記述していきます。
- 記述する内容は、実装済みの <FiveChannelRecorder /> をコピーしてください。
  - なお、パッケージ名を変えている場合は適宜変更してください。
## 起動で録音開始、終了で録音終了
- `samples/multiChannelAudioRecorder/app/src/main/java/com/example/fd/multichannelaudiorecorder/MainActivity.kt` が起動したら、  
録音を開始して、アプリが閉じられたら録音を停止するようにします。
- 必要最低限の実装としては以下になります。
  ```kotlin
  class MainActivity : ComponentActivity() {
  +  private var fiveChannelRecorder: FiveChannelRecorder? = null

     // (中略)

  +  override fun onResume() {
  +      super.onResume()
  +      if (!FiveChannelRecorder.checkPermission(this)) {
  +          return
  +      }
  +      fiveChannelRecorder = FiveChannelRecorder(this).apply {
  +          startRecording()
  +      }
  +  }
  +
  +  override fun onPause() {
  +      fiveChannelRecorder?.stopRecording()
  +      fiveChannelRecorder = null
  +      super.onPause()
  +  }
  ```
## デバッグ
- Android Studioからデバッグ実行して、THINKLETにこのアプリをインストールします。
  - ただし、初回デバッグ時は、Permissionを許可するような実装をしていませんので、何もできないアプリが起動するだけです。
- 次のコマンドでインストールしたアプリにPermissionを許可します。
  - scrcpyから画面操作をし、Permissionを許可しても構いません。
  ```bash
  # adb shell pm grant (パッケージ名) （許可するPermission名）
  adb shell pm grant com.example.fd.multichannelaudiorecorder android.permission.RECORD_AUDIO
  ```
- Android Studioからデバッグ実行をもう一度します。
- 20秒ほど起動し、音を出したり、マイクを抑えたりします。その後、THINKLETの電源ボタンを短押しして、画面をHomeに移動します。
  - scrcpy上でHomeに移動しても構いません。
- 録音されているかを確認するには、以下のコマンドでファイルが生成されているかを確認します。   
rawファイルが生成されていれば、録音できています。
  ```bash
  $ adb shell /sdcard/Android/data/com.example.fd.multichannelaudiorecorder/files/
  6ch_48kHz_2023-09-11-22-33-44.raw
  ```
## 再生
- 録音したファイルを取り出します。
  ```bash
  $ adb pull /sdcard/Android/data/com.example.fd.multichannelaudiorecorder/files/6ch_48kHz_2023-09-11-22-33-44.raw /path/to/save_dir/
  ```
- Rawファイルの再生には、[Audacity](https://www.audacityteam.org/) を使用します。
  - （soxコマンドなどが扱える方はそちらでも構いません）
- Audacityをインストールしたら、Audacityを起動します。
- 起動したら、`ファイル -> 取り込み -> ロー(Raw)データの取り込み` を選択します。
  - ![1](./img/audacity/1.jpg)
- adbで取り出したRawファイルを選択します。
- 録音したRawデータの設定をAudacityに教えます。今回は、チャンネル数は6、サンプリングレートは`48,000 Hz`ですので以下のように設定し、取り込みを選択します。
  - ![2](./img/audacity/2.jpg)
- 取り込みできると、以下のような画面になります。左上の再生ボタンから再生できます。
  - ![3](./img/audacity/3.jpg)
