import { useEffect, useState } from "react";
import { loadFromStorage, setToStorage } from "../../utils/loadFromStorage";
import { fetchRepositoryData } from "../../utils/fetchRepositoryData";
import staticRepoData from "../../utils/staticRepoData.json";
import GhRepositoryList from "./GhRepositoryList";

const GhRepository = ({ owner }) => {
  const url = `https://api.github.com/orgs/${owner}/repos?per_page=100`;
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
    .filter((item) => item.topics.includes("thinklet"))
    .map((item) => {
      return <GhRepositoryList item={item} />;
    });
};

export default GhRepository;
