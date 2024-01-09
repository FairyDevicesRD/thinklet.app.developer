---
tags:
  - THINKLET
  - Android
  - KeyConfig
---

# キーコンフィグを編集してみる
Androidでは、起動してから一番最初に表示されるアプリとして、任意のアプリを起動できるHome Launcherが起動します。  
THINKLETでもAndroidと同様に、Home Launcherアプリが動作します。  
scrcpyを介し、任意のアプリを起動できますが、scrcpyが扱えない環境では困ってしまいます。  
そこで、THINKLETの標準Launcherには、キーコンフィグ、つまりアーム部の3つのボタンの動作を変更する機能があります。

これを用いることで、画面操作なしで、ボタン操作だけで、設定したアプリを起動できます。  
ここでは、キーコンフィグの設定を通じて、これまで作成した録画、録音アプリをボタン操作だけで、起動できるようにしてみましょう。

## ボタン操作で録画アプリと録音アプリを起動できるようにしてみる
キーコンフィグを設定して、これまでの本ドキュメントで作成してきた、録画、録音アプリを起動してみましょう。
### 作成の前に
ここでは、adbコマンドを用いて、キーコンフィグの設定を確認します。  
キーコンフィグに設定する情報を確認するために、adbコマンドでアプリを起動します。  
アプリの起動には、次のコマンドを利用します。  
アプリの起動の確認には、scrcpyを用いて、画面を見て確認してください。

  ```console
  // highlight-next-line
  $ adb shell am start -n <パッケージ名>/<パッケージ名を含む起動するActivityクラス名>
  ```

例えば、[録画アプリをつくってみる](./4_buildRecord.md) で作成したアプリを起動するには、次のようになります。

  ```console
  // highlight-next-line
  $ adb shell am start -n com.example.fd.camera/com.example.fd.camera.MainActivity
  ```

この場合、パッケージ名は、`com.example.fd.camera` です。  
パッケージ名を含む起動するアクティビティクラス名は、 `com.example.fd.camera.MainActivity` です。  
もし、あなたが任意のパッケージ名や、クラス名に変更している場合は、適宜変更ください。  
キーコンフィグの設定には、この起動したいアプリの「パッケージ名」と、「パッケージ名を含む起動するアクティビティクラス名」が必要となります。

:::tip
キーコンフィグを設定しても、任意のアプリが起動しないときは、一度Adbコマンドから実行してみることで、デバッグ、動作確認できます。
:::

同様に、[マルチマイクで録音するアプリをつくってみる](./5_buildMultiMic.md) で作成したアプリを起動する設定も確認します。  
本ドキュメントの通りならば、次のようになります。

  ```console
  // highlight-next-line
  $ adb shell am start -n com.example.fd.multichannelaudiorecorder/com.example.fd.multichannelaudiorecorder.MainActivity
  ```

この場合、パッケージ名は、`com.example.fd.multichannelaudiorecorder` です。  
パッケージ名を含む起動するアクティビティクラス名は、 `com.example.fd.multichannelaudiorecorder.MainActivity`です。

### キーコンフィグの作成
[作成の前に](#作成の前に)で確認した設定値を参考に、キーコンフィグファイルを作成しましょう。  
キーコンフィグファイルは、JSON形式のテキストファイルで記述されます。  
詳細については[キーコンフィグの詳細](#キーコンフィグの詳細)を確認ください。現時点ではなんとなくの理解で構いません。

ここでは以下機能となる設定を用意しました。
- `KEYCODE_VOLUME_DOWN` がアサインされたボタンを短く押して離したら、「録画を開始」
- `KEYCODE_VOLUME_UP` がアサインされたボタンを短く押して離したら、「録音を開始」

:::info
`KEYCODE_VOLUME_DOWN` などのアサインは、[ハードウェア仕様](./1_startGuide.md#ハードウェア仕様) を確認ください。
:::

パッケージ名やクラス名は、本ドキュメントで例示したものに合わせています。  
必要に応じて、[作成の前に](#作成の前に)で確認した設定値に適宜変更ください。  
キーコンフィグファイルは、デスクトップなど任意のディレクトリ、フォルダに `key_config.json` として保存します。

  ```json
  {
    "key-config": [
      {
        "key-name": "left",
        "key-event": "single-released",
        "key-action": {
          "action-type": "launch-app",
          "action-param": {
            "package-name": "com.example.fd.camera",
            "class-name": "com.example.fd.camera.MainActivity",
            "action-name": "android.intent.action.MAIN",
            "flags": [
              "FLAG_ACTIVITY_NEW_TASK",
              "FLAG_ACTIVITY_RESET_TASK_IF_NEEDED"
            ]
          }
        }
      },
      {
        "key-name": "right",
        "key-event": "single-released",
        "key-action": {
          "action-type": "launch-app",
          "action-param": {
            "package-name": "com.example.fd.multichannelaudiorecorder",
            "class-name": "com.example.fd.multichannelaudiorecorder.MainActivity",
            "action-name": "android.intent.action.MAIN",
            "flags": [
              "FLAG_ACTIVITY_NEW_TASK",
              "FLAG_ACTIVITY_RESET_TASK_IF_NEEDED"
            ]
          }
        }
      }
    ]
  }
  ```

### キーコンフィグをTHINKLETに反映する
作成したキーコンフィグをTHINKLETに反映しましょう。  
PowerShellやターミナルを起動し、作成したキーコンフィグを配置したフォルダ、ディレクトリまで移動します。

:::tip

Windowsの場合は、エクスプローラーから `Shiftキー` ＋ `右クリック` 
のコンテキストメニュー上の `PowerShellウィンドウをここで開く` から、任意のディレクトリから開くことができます。

:::

`adb push` を使うことで、PC上のファイルをTHINKLET上にコピーできます。  
これを用いて、PC上のキーコンフィグファイルをTHINKLETに配置します。以下のコマンドを1行ずつ実行してください。

  ```console
  // highlight-start
  $ adb push key_config.json /sdcard/Android/data/ai.fd.thinklet.app.launcher/files/key_config.json
  $ adb shell input keyevent KEYCODE_APP_SWITCH
  $ adb shell input keyevent HOME
  // highlight-end
  ```

`adb shell input keyevent xxxx` は、画面をタップするようなキーイベントを実行させるコマンドです。  
Android/THINKLETの開発では便利な機能です。     
ここでは、キーコンフィグを反映させるために、画面を操作し、Launcherに再読み込みをさせています。
### 動かしてみる
キーコンフィグを設定したら、正しく動作しているかを確認しましょう。
- アプリが起動されているかを確認するために、scrcpyでTHINKLETの画面を表示しておきます。
- `KEYCODE_VOLUME_DOWN` がアサインされたボタンを短く押して離します。録画アプリが起動したら成功です。  
録画アプリを終了するには、電源ボタンを短く押して離します。
- 次に、`KEYCODE_VOLUME_UP` がアサインされたボタンを短く押して離します。  
録音アプリが起動したら成功です。録音アプリを終了するには、電源ボタンを短く押して離します。

もし、設定したアプリが正しく動作しない場合は、[作成の前に](#作成の前に) から確認してください。

### (補足) flags について
- keyConfigに指定している `flags` は、アプリを起動するためのオプションとして追加しています。
- `FLAG_ACTIVITY_NEW_TASK`, `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED` の2つは、Launcherから起動する際に付与されます。
- KeyConfigでは省略できますが、特別理由がない限りは、付与しておくことを推奨しています。

## キーコンフィグの詳細
- [キーコンフィグ詳細](../keyConfig/keyConfig.md)

少し発展的な内容です。キーコンフィグは以下のようなオプションの設定が可能です。  
まだAndroidのアプリ開発経験が浅い方は、読み飛ばしていただいて構いません。

