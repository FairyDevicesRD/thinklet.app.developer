---
tags:
  - THINKLET
  - Android
---

import {Samples} from '../_links.js'

# THINKLET cube開発ガイドライン
ここでは、THINKLET cubeアプリを実装する際に気をつけたほうが良いことを説明しています。

## Adbについて
前提として、THINKLET cubeアプリ開発には、adb接続が必須です。**THINKLET cubeの開発者モードをOFFにする際は十分にそのリスクを理解してください**  
しかしながら、ユーザーに使ってもらう際は、adbを無効化しておくほうが、盗難・紛失時に安全です。  
[thinklet.app.sdk](https://github.com/FairyDevicesRD/thinklet.app.sdk) を用いることで、どんなアプリからでもadbをON/OFFできます。

## 使用者は画面操作ができません
THINKLET cubeには画面がありません。  
通常のAndroidアプリで利用されるダイアログによるPermissionの確認を出したとしても、ユーザーはOKを選ぶことはできません。  
そのため、THINKLET cubeを使うユーザーに対しては、Permissionを事前に許可しましょう。

最も簡単な方法は、アプリをインストールする際に、Permissionを許可してInstallする方法です。  
下記のように、`-g` オプションを付与してインストールすることが、許可された状態でインストールされます。
```console
// highlight-next-line
$ adb install -g xxx.apk
```

または、Permissionとパッケージ名を指定して、許可できます。
```console
// highlight-next-line
$ adb shell pm grant <パッケージ名> <Permission名>
```

## Sleepしないようにする
前述の通り、THINKLET cubeには画面がありません。  
Sleep、つまりDozeモードになってしまうと、ユーザーでその都度電源ボタンを押して、Sleepを解除してもらう必要がでてきます。  
Sleep機能は、省電力になるメリットがありますが、据置機としては、好ましくありません。  
設置し動作している最中にいつの間にか、Sleepになってしまい、正しい動作挙動にならないことがあります。

画面をオンのままにする方法は、Androidと共通で、`FLAG_KEEP_SCREEN_ON` フラグを追加します。
  - [developer.android.com #wakelock](https://developer.android.com/training/scheduling/wakelock#screen)
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    // highlight-next-line
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
}
```

## ユーザーフィードバックの重要性
THINKLET cubeの特性上、あなたの開発したアプリが、どのような状態であるかが、ユーザーに分かりづらいと、ユーザーは困惑してしまいます。  
適切に、あなたのアプリがどのような状態であるかがわかる手段を検討ください。  
最も簡単な方法は、`音声ガイド` です。  
例えば、あなたのアプリ上で、ボタンが長押しされたら、撮影中であることを発話させるなどです。

## 音声フォーカス
THINKLET cubeやAndroidアプリでは、異なるアプリから、同じ出力ストリームに対して、同時に音声を再生できます。  
この場合、ミックスされた音声となって再生されます。これはユーザーにとっては非常に困惑してしまいます。  
これを避けるために、Androidの仕組みとして、`音声フォーカス` という概念があります。  
THINKLET cubeでもこの `音声フォーカス` の概念をポリシーとしています。

`音声フォーカス` を理解するためには、[Amazon Fire TV](https://developer.amazon.com/ja/docs/fire-tv/multimedia-app-requirements.html) の要件が非常に明快かつ簡潔です。  
また、補足として、 [developer.android.com #audio-focus](https://developer.android.com/guide/topics/media-apps/audio-focus) 確認ください。

## ライフサイクルへの意識
Androidでは、画面分割、オーバーレイ、バックグラウンドの機能により、そのアプリがトップにいなくても動作します。  
もちろん、THINKLET cubeでも動作はしますが、ユーザーにより終了させることができなくなってしまいます。  
画面が見えないユーザーからすると、カメラが今使用されている不安に繋がります。

そこで、THINKLET cubeでは、電源ボタンを押したら、Homeに戻るという機能をOSレベルで実現しています。  
これにより、**ユーザーはとにかく電源ボタンを押せば、最初からやり直せる** ようになります。  

特に、他のアプリと同時に利用ができないカメラやマイクを扱う際は、`Activity`のライフサイクルに紐付けるように実装するようにしてください。  
`onResume`したら、利用していい、`onPause`されたら、停止処理を実行するなどです。

詳しくは、本ドキュメントで提供紹介している <Samples /> を参照ください。  

## 保存先（File）
THINKLET cubeに限った話ではありませんが、ファイルの保存先は適切にしましょう。  
例えば、あなたのアプリのみがアクセスできて十分であるならば、[Context.getFilesDir()](https://developer.android.com/reference/android/content/Context#getFilesDir())を使いましょう。
```console
/data/data/[package_name]/files/
```
配下に保存されます。  
Adbコマンドからも取り扱いたい、大きめのファイルを保存したいならば、[Context.getExternalFilesDir()](https://developer.android.com/reference/android/content/Context#getExternalFilesDir(java.lang.String)) を使いましょう。
```console
/sdcard/Android/data/[package_name]/files/
```
配下に保存されます。  
[Enviroment.getExternalStorageDirectory()](https://developer.android.com/reference/android/os/Environment#getExternalStorageDirectory()) など、他のアプリからもアクセスできてしまう領域は非推奨です。  
もし、他のアプリとのファイル共有をしたいならば、[FileProvider](https://developer.android.com/training/secure-file-sharing/setup-sharing) を使いましょう。

## Google Play開発者サービス 系ライブラリ
`Google Play開発者サービス` に依存するライブラリは、THINKLET cubeではサポートされていないため、動作しません。

## OSSライセンス表記
商用向けの情報です。THINKLET cubeには画面がありませんので、アプリ内部に表記しても、ユーザーが常に見ることはできません。  
そこで、アプリ開発に用いたOSSのライセンスは、一覧を作成し、静的ページとして表示するなどの工夫をする必要があります。  
FairyDevicesでは、[AboutLibraries](https://github.com/mikepenz/AboutLibraries) を利用し、ライセンスファイルの一覧を作成し、ビューアーアプリで閲覧できるようにしています。
- 例：LINKLET
  - https://linklet-oss-license.linklet.ai/#/

## Launcherアプリの追加は非推奨
THINKLET cubeは、Android互換ですので、Android用のLauncherアプリを追加できます。  
しかし、再起動するたびにUI上で、使用するLauncherアプリを選ばなければならなくなります。  
これは、THINKLET cubeの性質上、ユーザー体験を損なうことになるため、推奨していません。
