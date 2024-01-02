---
tags:
  - THINKLET
  - adb
  - System Update
---

# システムアップデート
ここでは、THINKLETのシステムアップデートの手順をまとめています。  
システムアップデートでは、THINKLETのプリインストールアプリとOSの更新ができます。  
最新の機能の提供や、不具合の修正がなされていますので、定期的に確認ください。

:::info
THINKLETのシステムアップデートには、`adb` 接続が必要です。  
設定がまだの方は、先に、[adb設定](../startGuide/3_helloworld.md#adb設定) を確認ください。
:::

:::warning
ここで紹介するTHINKLETのシステムアップデートの手順は、お使いのTHINKLETが、`10.000.0` 以降バージョンで動作します。  
今のバージョンの確認方法は、以下のadbコマンドで確認できます。
```console
// highlight-next-line
$ adb shell getprop ro.sys.fd.version
10.000.0
```
:::

## システムアップデートを確認する
利用可能なシステムアップデートがあるかを確認する方法です。  
以下の手順で確認できます。

1. 電源をつけ、adb接続ができるTHINKLETとPCを接続します。
2. THINKLETをWi-Fi、またはSIMカードを用いて、モバイルネットワークに接続し、THINKLETをオンラインにします。
3. 次のコマンドを実行します。
  ```console
  // highlight-start
  $ adb shell dumpsys activity service \
      ai.fd.thinklet.app.mdmclient/.MdmClientService \
      --firmware hasUpdate
  // highlight-end
  ```
次のように表示される場合、利用可能なアップデートがあります。  
  ```console
  SERVICE ai.fd.thinklet.app.mdmclient/.MdmClientService xxxx pid=xxxx
    Client:
      Version 10.000.0 is available
  ```
次のように表示される場合、すでに最新を利用しています。アップデートの必要はありません。
  ```console
  SERVICE ai.fd.thinklet.app.mdmclient/.MdmClientService xxxx pid=xxxx
    Client:
      This is the latest version
  ```

## システムアップデートを実行する
システムアップデートを実行する方法を説明します。

:::warning
システムアップデート中は、サーバーからサイズの大きいファイルを取得します。  
安定したネットワークの確保、THINKLET本体に十分充電がされていることを確認ください。
:::

以下の手順でアップデートができます。
1. 電源をつけ、adb接続ができるTHINKLETとPCを接続します。
2. THINKLETをWi-Fi、またはSIMカードを用いて、モバイルネットワークに接続し、THINKLETをオンラインにします。
   - システムアップデートには通信が発生します。**安定したWi-Fiのご利用を強く推奨**します。
3. 次のコマンドを実行します。
  ```console
  // highlight-start
  $ adb shell dumpsys activity service \
      ai.fd.thinklet.app.mdmclient/.MdmClientService \
      --firmware update
  // highlight-end
  ```
次のように表示される場合、アップデートが正常に開始しています。
  ```console
  SERVICE ai.fd.thinklet.app.mdmclient/.MdmClientService xxxx pid=xxxx
    Client:
      Downloading update files...
  ```
THINKLETが自動で再起動されるのをそのままお待ち下さい。  
アップデートが正常に進行しているか確認する場合は、[その他、システムアップデートの便利な機能](#その他システムアップデートの便利な機能) の `progress` コマンドで確認ください。  
再起動後、[アップデートがあるかを確認する](#アップデートがあるかを確認する) と同じ手順で、正常にアップデートが完了したことを確認できます。

## エラーとその対応
システムアップデート実行・確認時に表示されるエラーメッセージと、対処法を説明します。
1. `No active network`
   - 原因
     - THINKLETがオフライン
     - システムアップデートのサーバーとの接続ができないネットワークに接続されている
   - 対処法
     - THINKLETを外部のネットワークと接続ができる安定して高速なネットワークに接続してください
2. `Network timeout`
   - 原因
     - システムアップデートを確認・実行するのに十分なネットワークへ接続されていません
   - 対処法
     - THINKLETを外部のネットワークと接続ができる安定して高速なネットワークに接続してください
3. `Not enough storage`
   - 原因
     - システムアップデートのファイルを一時的に保存するための容量がありません
   - 対処法
     - THINKLETの本体ストレージから不要なファイル、アプリケーションを削除してください
4. `Not enough battery. Please charge.`
   - 原因
     - システムアップデートを実行するために十分な充電がなされていません
   - 対処法
     - THINKLETを充電してください
5. その他エラー
   - 対処法
     - THINKLETを十分に充電します
     - 安定したWi-Fiに接続し直します
     - 高負荷となっている可能性がある常駐アプリケーションを停止してください
     - THINKLET本体ストレージの空き容量を確保してください
     - THINKLETを再起動してください
     - `ai.fd.thinklet.app.mdmclient` を停止していないか確認ください
## その他、システムアップデートの便利な機能
システムアップデートの便利なコマンドについて説明します。  
アップデートを実行する `update`, アップデートを確認する `hasUpdate` 以外に次の機能があります。
1. `progress`
システムアップデートのためのファイル取得状況を表示します。  
`update` を実行した後、進捗を確認したい場合に利用できます。
   - 実行例
     ```console
     // highlight-start
     $ adb shell dumpsys activity service \
       ai.fd.thinklet.app.mdmclient/.MdmClientService \
       --firmware progress
     // highlight-end
     ```
   - 実行結果
     ```console
     SERVICE ai.fd.thinklet.app.mdmclient/.MdmClientService xxxx pid=xxxx
       Client:
         Downloading: 12 %
     ```
2. `current`
現在のTHINKLETのバージョンを表示します。  
`adb shell getprop ro.sys.fd.version` で取得できる結果と同じです。
   - 実行例
     ```console
     // highlight-start
     $ adb shell dumpsys activity service \
       ai.fd.thinklet.app.mdmclient/.MdmClientService \
       --firmware current
     // highlight-end
     ```
   - 実行結果
     ```console
     SERVICE ai.fd.thinklet.app.mdmclient/.MdmClientService xxxx pid=xxxx
       Client:
         Current firmware version: 10.000.0
     ```
