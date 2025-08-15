import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Translate from "@docusaurus/Translate";
import { loadFromStorage, setToStorage } from "../../utils/loadFromStorage";
import { fetchRepositoryData } from "../../utils/fetchRepositoryData";
import staticRepoData from "../../utils/staticRepoData.json";

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
                <th>🖼️ Preview </th>
              </tr>
            </thead>
            <tbody>{OwnerList.map((props) => <GhRepository key={props.owner} {...props} />)}</tbody>
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

  const hasStaticData =
    Array.isArray(staticRepoData) && staticRepoData.length > 0;

  useEffect(() => {
    // 静的データが存在する場合は、それを使用
    if (hasStaticData) {
      setRepoData(staticRepoData);
      setLoading(false);
      return;
    }

    // 静的データがない場合は、ローカルストレージから取得を試みる
    const cachedData = loadFromStorage(localStorage, cacheKey);
    if (cachedData) {
      setRepoData(cachedData);
      setLoading(false);
      return;
    }

    // ローカルストレージにもない場合は、動的にAPIから取得
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
  }, [owner, hasStaticData]);

  if (loading) return;
  if (error) return;
  if (!repoData) return;

  return repoData
    .filter((item) => item.topics?.includes("thinklet"))
    .map((item) => {
      const defaultBranch = item.default_branch || "main";

      return (
        <tr key={item.id || item.node_id || item.full_name}>
          <td>{item.description}</td>
          <td>
            <a href={item.html_url} target="_blank" rel="noopener noreferrer">
              {item.full_name}
            </a>
          </td>
          <td>{new Date(item.pushed_at).toLocaleDateString()}</td>
          <td>{convertLicense(item)}</td>
          <td>
            <a href={item.html_url} target="_blank" rel="noopener noreferrer">
              <img
                src={
                  item.ogImage ||
                  `https://raw.githubusercontent.com/${item.full_name}/${defaultBranch}/.github/social-preview.png`
                }
                alt={`Preview of ${item.name || item.full_name.split("/")[1]}`}
                className={styles.previewImage}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://opengraph.githubassets.com/1/${item.full_name}`;
                }}
              />
            </a>
          </td>
        </tr>
      );
    });
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
