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

async function fetchRepositoriesFromOrg(organization) {
  try {
    const response = await axios.get(
      `https://api.github.com/orgs/${organization}/repos?per_page=100`
    );

    return response.data.filter(
      (repo) => repo.topics && repo.topics.includes("thinklet")
    );
  } catch (error) {
    console.error(
      `Failed to fetch repositories for ${organization}:`,
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
    "selfOrgs",
    "otherOrgs",
  ],
  default: {
    selfOrgs: "FairyDevicesRD",
    otherOrgs: "",
  }
});

const selfOrgs = argv.selfOrgs ? argv.selfOrgs.split(",") : [];
const otherOrgs = argv.otherOrgs ? argv.otherOrgs.split(",") : [];

async function fetchStaticRepositoryData(selfOrgs, otherOrgs) {

  console.log("Fetching repositories for self organizations:", selfOrgs);
  console.log("Fetching repositories for other organizations:", otherOrgs);

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

  async function processOrgList(orgsList, targetArray) {
    for (const org of orgsList) {
      const repos = await fetchRepositoriesFromOrg(org);
      for (const repo of repos) {
        const processedRepo = await processRepo(repo);
        targetArray.push(processedRepo);
      }
    }
  }

  await processOrgList(selfOrgs, selfRepos);
  await processOrgList(otherOrgs, otherRepos);

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

fetchStaticRepositoryData(selfOrgs, otherOrgs).catch((error) => {
  console.error("Error in staticRepoData:", error);
  process.exit(1);
});
