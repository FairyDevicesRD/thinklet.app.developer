import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Translate from "@docusaurus/Translate";
import { loadFromStorage, setToStorage } from "../../utils/loadFromStorage";
import { fetchRepositoryData } from "../../utils/fetchRepositoryData";

import styles from "./styles.module.css";

const OwnerList = [
  {
    owner: "FairyDevicesRD",
  },
];

export default function HomepageUsages() {
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
              </tr>
            </thead>
            <tbody>{OwnerList.map((owner) => GhRepository(owner))}</tbody>
          </table>
        </div>
        <div className="container">
          <a
            href="https://github.com/FairyDevicesRD"
            target="_blank"
            rel="noopener noreferrer"
          >
            and more...
          </a>
        </div>
      </div>
    </section>
  );
}

function GhRepository({ owner }) {
  const url = `https://api.github.com/orgs/${owner}/repos`;
  const cacheKey = `cache_${url}`;

  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedData = loadFromStorage(localStorage, cacheKey);
    if (cachedData) {
      setRepoData(cachedData);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await fetchRepositoryData(url);

      if (error) {
        setError(error.message);
      } else {
        setRepoData(data);
        setToStorage(localStorage, cacheKey, data);
      }
      setLoading(false);
    })();
  }, [owner]);

  if (loading) return;
  if (error) return;
  if (!repoData) return;

  return repoData
    .filter((item) => item.topics.includes("thinklet"))
    .map((item) => (
      <tr key={item.id}>
        <td>{item.description}</td>
        <td>
          <a href={item.html_url} target="_blank" rel="noopener noreferrer">
            {item.full_name}
          </a>
        </td>
        <td>{new Date(item.pushed_at).toLocaleDateString()}</td>
        <td>{convertLicense(item)}</td>
      </tr>
    ));
}

function convertLicense(item) {
  if (item.license?.name == null || item.license?.url == null) {
    return (
      <a href={item.html_url} target="_blank" rel="noopener noreferrer">
        See Repository
      </a>
    );
  } else {
    return item.license.name;
  }
}
