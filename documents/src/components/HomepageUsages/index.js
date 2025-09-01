import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import GhRepository from "@site/src/components/GhRepository/GhRepository";

import styles from "./styles.module.css";

const OwnerList = [
  {
    owner: "FairyDevicesRD",
  },
];

export default function HomepageUsages() {
  const MORE_REPOS_URL = "https://github.com/topics/thinklet";
  return (
    <section className={clsx(styles.usageBanner)}>
      <div className="container">
        <h1>
          <Translate id="homepage.usage" description="homepage usage" />
        </h1>
        <h3>
          <Translate
            id="homepage.usage.description"
            description="homepage usage"
          />
        </h3>
        <div className={clsx(styles.usageTableBox)}>
          <table className={clsx(styles.usageTable)}>
            <thead>
              <tr>
                <th>ℹ️ Description </th>
                <th>🔗 URL </th>
                <th>📅 Last Updated </th>
                <th>⚖️ LICENSE </th>
                <th>🖼️ Preview </th>
              </tr>
            </thead>
            <tbody>
              {OwnerList.map((props) => (
                <GhRepository key={props.owner} {...props} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="container">
          <a href={MORE_REPOS_URL} target="_blank" rel="noopener noreferrer">
            and more...
          </a>
        </div>
      </div>
    </section>
  );
}
