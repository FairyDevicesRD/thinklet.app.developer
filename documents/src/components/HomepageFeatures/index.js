import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Androidとの互換性",
    Svg: require("@site/static/img/undraw_android_jr64.svg").default,
    description: (
      <>
        THINKLETは、Android SDKと互換性があります。
        Androidアプリの開発資産をTHINKLETのアプリ開発に利用することができます。
      </>
    ),
  },
  {
    title: "THINKLET独自機能を提供するSDK",
    Svg: require("@site/static/img/undraw_developer_activity_re_39tg.svg")
      .default,
    description: (
      <>
        THINKLET固有の機能を利用できる専用SDKを提供しています。
        例えば、5つのマイクを使った録音機能や、シャットダウンや再起動などの機能を利用できます。
      </>
    ),
  },
  {
    title: "単体で通信",
    Svg: require("@site/static/img/undraw_internet_on_the_go_re_vben.svg")
      .default,
    description: (
      <>
        THINKLETは、Wi-Fiはもちろん、<code>nanoSIM</code>{" "}
        を使ったLTE通信が可能なセルラーモデルです。
        他のデバイスや専用アプリ経由を使ったネットワーク接続は不要です。THINKLET単体で通信します。
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
