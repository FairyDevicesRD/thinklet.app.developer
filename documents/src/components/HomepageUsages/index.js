import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import staticSelfRepoData from "../../utils/staticRepoData.json";
import staticOtherRepoData from "../../utils/staticOtherRepoData.json";
import styles from "./styles.module.css";
import accounts from "../../constants/accounts";
import AccountRepositoriesTable from "./AccountRepositoriesTable";

const { selfAccounts, otherAccounts } = accounts;

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
          <AccountRepositoriesTable accounts={selfAccounts} repoData={staticSelfRepoData} />
        </div>
        <h3>
          <Translate
            id="homepage.usage.description.for.partners"
            description="homepage usage for partners"
          />
        </h3>
        <div className={clsx(styles.usageTableBox)}>
          <AccountRepositoriesTable accounts={otherAccounts} repoData={staticOtherRepoData} />
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
