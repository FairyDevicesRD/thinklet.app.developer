---
tags:
  - THINKLET
  - Android
---

# 映像を撮ってみる
基本的なTHINKLETの開発者向けのツールを導入しつつ、THINKLETで撮影できる映像や音声がどのようなものかを体験してみましょう。
## 開発者画面を表示
ここでは、映像を体験するために、THINKLETの基本的な開発ツールを導入します。  
THINKLETにはディスプレイは搭載されていません。  
しかし、以下の手順で、開発者向けのツールを導入することで、PC上に開発者画面を表示できます。  
つまり、THINKLETはディスプレイを持たないだけで、それ以外はAndroidデバイスとほぼ同じです。

1. THINKLETの電源をつけていない場合、電源をつける
   - 電源ボタンを振動するまで長押しをしてください。
   - 日本語音声で「電源をつけました」、または英語音声で「Power On」とアナウンスされたら起動完了です。
2. PCとTHINKLETをUSBケーブルで接続する
   - THINKLETのUSB Type-C ポートは、充電とデータ通信を兼用しています。
   - 接続に用いるUSBケーブルは、データ通信対応のものを使用します。
3. PCに [scrcpy](https://github.com/Genymobile/scrcpy) をインストールします
   - `scrcpy` は、Genymobile社が提供する`adb`を用いて、Androidデバイスの画面をPCにミラーリングするソフトウェアです。  
   Windows, macOS,Linux向けにそれぞれ提供されています。THINKLETもAndroidと互換性がありますので`scrcpy`が利用できます。
     - 類似のソフトウェアとして、`Vysor`,`Total Control` などもありますが、どちらもミラーリングするデバイスに専用のアプリをインストールします。
     - `scrcpy`は専用のアプリのインストールを必要としません。利用後に不要なアプリを削除する手間が不要ですので、`scrcpy`を推奨しています。また、`scrcpy`はミラーリングだけでなく、マウスやキーボードから操作をできます。
   - インストール手順は下記を参照ください。
     - Windows向け：https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md
     - Linux向け：https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md
     - macOS向け：https://github.com/Genymobile/scrcpy/blob/master/doc/macos.md
4. scrcpyを実行
   - `scrcpy` (Windowsであれば、`scrcpy.exe`) を実行します。
   - 下記のような画面がPC上に表示されれば、正しくTHINKLETと接続や、scrcpyのインストールができています。
  
    <img
      src={require('./img/launcher/home.jpg').default}
      style={{ width: '300px', margin: '20px'}}
    />

:::info

scrcpyは、adb経由でミラーリングを行っています。
すでにadbを導入している場合、scrcpyとバージョンが合わずに、正しく動作しないことがあります。
その場合は、scrcpy側のadbのバージョンに合わせるなどすることで解消されます。

:::

:::caution

セキュリティソフトにより、scrcpyが正常に、動作しないことがあります。
執筆当時ですと、デフォルトで、TCP port `5555` を使用しています。
適宜セキュリティソフトの設定を変更するか、使用するポートを変更するなどしてください。

:::

## カメラアプリを試す
THINKLETにプリインストールしているカメラアプリを起動し、写真や動画を撮影してみましょう。

1. scrcpyを用いて、THINKLETの開発者画面を操作して、`Snapdragon Camera` アプリを起動します。

  <img
    src={require('./img/launcher/home.jpg').default}
    style={{ width: '300px', margin: '20px'}}
  />

2. このアプリは、画面右下から写真撮影、動画撮影モードを切り替えることができます。

  <img
    src={require('./img/snapdragon/choose.jpg').default}
    style={{ width: '300px', margin: '20px'}}
  />

3. 画面下部の撮影ボタンや録画開始ボタンで、写真撮影、録画開始/停止をできます。

  <img
    src={require('./img/snapdragon/startRecord.jpg').default}
    style={{ width: '300px', margin: '20px'}}
  />

  <img
    src={require('./img/snapdragon/recorrding.jpg').default}
    style={{ width: '300px', margin: '20px'}}
  />

## 撮影した映像を再生
[前項](#カメラアプリを試す)で撮影した動画を再生してみましょう。

1. scrcpy上で確認する
   - `Snapdragon Camera` アプリの画面左下のサムネイルから再生アプリを起動できます。

    <img
      src={require('./img/snapdragon/recorded.jpg').default}
      style={{ width: '300px', margin: '20px'}}
    />

2. PC上で確認する
   - adbコマンドで取得します。少し前後してしまいますので、飛ばして構いません。
   - adbコマンドの設定は、[adb設定](./3_helloworld.md#adb設定)を参照ください。
   - THINKLETに保存されているファイルをadbコマンドで取り出します。  
   adbコマンドが正しく実行できない場合はパスが通っていない可能性があります。
    ```console
    # 1. 撮影したファイル名を取得します
    // highlight-next-line
    $ adb shell ls /sdcard/DCIM/Camera/
    VID_20230907_175942.mp4
    ```

    # 2. 撮影したファイルを取り出します。
    // highlight-next-line
    $ adb pull /sdcard/DCIM/Camera/VID_20230907_175942.mp4 /path/to/save_dir/
    /sdcard/DCIM/Camera/VID_20230907_175942.mp4: 1 file pulled, 0 skipped. 10.8 MB/s (41748967 bytes in 3.704s)
    ```
   - 撮影した動画は、一般的な動画再生プレイヤーで視聴できます。
