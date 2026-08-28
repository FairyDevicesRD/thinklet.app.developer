const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const CACHE_FILE = path.join(__dirname, "githubRepoCache.json");

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.warn("キャッシュの読み込みに失敗しました:", error.message);
  }
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`キャッシュを保存しました: ${CACHE_FILE}`);
  } catch (error) {
    console.error("キャッシュの保存に失敗しました:", error.message);
  }
}

async function fetchRepositoriesFromAccount(accountName) {
  try {
    const { data: accountInfo } = await axios.get(
      `https://api.github.com/users/${accountName}`
    );
    const reposUrl =
      accountInfo.type === "Organization"
        ? `https://api.github.com/orgs/${accountName}/repos?per_page=100`
        : `https://api.github.com/users/${accountName}/repos?per_page=100`;

    const response = await axios.get(reposUrl);

    return response.data.filter(
      (repo) => repo.topics && repo.topics.includes("thinklet")
    );
  } catch (error) {
    console.error(
      `Failed to fetch repositories for ${accountName}:`,
      error.message
    );
    return [];
  }
}

async function fetchOgImageForRepo(repoFullName) {
  try {
    const response = await axios.get(`https://github.com/${repoFullName}`);
    const $ = cheerio.load(response.data);
    return $('meta[property="og:image"]').attr("content");
  } catch (error) {
    console.error(
      `Failed to fetch OG image for ${repoFullName}:`,
      error.message
    );
    return null;
  }
}



// --- 引数パース ---
const argv = minimist(process.argv.slice(2), {
  string: [
    "selfAccounts",
    "otherAccounts",
  ],
  default: {
    selfAccounts: "FairyDevicesRD",
    otherAccounts: "",
  }
});

const selfAccounts = argv.selfAccounts ? argv.selfAccounts.split(",") : [];
const otherAccounts = argv.otherAccounts ? argv.otherAccounts.split(",") : [];

async function fetchStaticRepositoryData(selfAccounts, otherAccounts) {

  console.log("Fetching repositories for self accounts:", selfAccounts);
  console.log("Fetching repositories for other accounts:", otherAccounts);

  const cache = loadCache();
  let selfRepos = [];
  let otherRepos = [];

  async function processRepo(repo) {
    const cacheKey = repo.full_name;
    const cachedData = cache[cacheKey];

    if (cachedData && cachedData.updated_at === repo.updated_at) {
      console.log(`キャッシュを使用: ${repo.full_name}`);
      return { ...repo, ogImage: cachedData.ogImage };
    }

    console.log(`OG画像を取得中: ${repo.full_name}`);
    const ogImage = await fetchOgImageForRepo(repo.full_name);

    cache[cacheKey] = {
      updated_at: repo.updated_at,
      ogImage: ogImage,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { ...repo, ogImage: ogImage };
  }

  async function processAccountList(accountsList, targetArray) {
    for (const account of accountsList) {
      const repos = await fetchRepositoriesFromAccount(account);
      for (const repo of repos) {
        const processedRepo = await processRepo(repo);
        targetArray.push(processedRepo);
      }
    }
  }

  await processAccountList(selfAccounts, selfRepos);
  await processAccountList(otherAccounts, otherRepos);

  saveCache(cache);
  
  const dataDir = path.join(__dirname, "../utils");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // ファイル出力
  if (selfRepos.length > 0) {
    const outputPath = path.join(dataDir, "staticRepoData.json");
    fs.writeFileSync(outputPath, JSON.stringify(selfRepos, null, 2));
    console.log(`repository data saved to ${outputPath}`);
  }

  if (otherRepos.length > 0) {
    const outputPath = path.join(dataDir, "staticOtherRepoData.json");
    fs.writeFileSync(outputPath, JSON.stringify(otherRepos, null, 2));
    console.log(`repository data saved to ${outputPath}`);
  }
}

fetchStaticRepositoryData(selfAccounts, otherAccounts).catch((error) => {
  console.error("Error in staticRepoData:", error);
  process.exit(1);
});
