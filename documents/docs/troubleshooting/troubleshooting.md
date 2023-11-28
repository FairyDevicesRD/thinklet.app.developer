---
tags:
  - THINKLET
  - Android
  - adb
---

# トラブルシューティング
ここでは、THINKLETの開発時・利用時に発生するトラブルへの対処法をまとめています。

## 電源がつかない
以下のフローで試してみてください。  
バッテリーが少ない、デバイスがハングアップしているケースがあります。

```mermaid
stateDiagram-v2
    state "THINKLETと付属のUSBケーブル・充電器に接続" as A1
    state "30分ほど充電してから、電源ボタン長押しで起動" as A2
    state "30分ほど充電" as B1
    state "THIKLETからUSBケーブルを外してから、電源を20秒長押し" as B2
    state "完了" as X
    state "FairyDevicesまで連絡" as XYZ

    [*] --> A1
    A1 --> A2: if LEDが点灯する
    A1 --> B1 : if LEDが点灯しない
    B1 --> B2: 

    A2 --> X: if 起動する
    A2 --> B2: if 起動しない

    B2 --> XYZ: if 起動しない
    B2 --> X: if 起動する
```

## Adb接続ができない
開発者モードをOFFにしてしまい、復旧できないケースは弊社までご連絡ください。  
開発者モードはONであるが、機器の再起動、不要な機器の切断をした上で、  
エミュレータや他のAndroidデバイスでは問題がない場合も弊社までご連絡ください。

```mermaid
stateDiagram-v2
    state "THINKLETの開発者モードをOFFにしたか？" as S0

    state "PCからできるだけ機器を取り外す" as A0
    state "THINKLETとPCを付属のUSBケーブルで接続" as A1

    state "adb kill-serverを実行" as B1
    state "adb devicesを実行" as B2

    state "PC と THINKLET を再起動" as C1
    state "adb devicesを実行" as C2

    state "THINKLETを取り外し、Androidエミュレータを起動。adb devicesを実行" as D1

    state "接続完了" as X
    state "FairyDevicesまで連絡" as XYZ

    [*] --> S0: 
    S0 --> XYZ: if Yes
    S0 --> A0: if No
    A0 --> A1: 
    A1 --> B1: 
    B1 --> B2: 
    B2 --> X: if 認識する
    B2 --> C1: if 認識しない
    C1 --> C2: 
    C2 --> X: if 認識する
    C2 --> D1: if 認識しない
    D1 --> XYZ: if 認識する
    D1 --> PC側の問題が想定されます: if 認識しない
```
