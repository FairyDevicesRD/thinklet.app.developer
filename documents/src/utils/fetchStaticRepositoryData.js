const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

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

  let selfRepos = [];
  let otherRepos = [];

  // 自社組織
  for (const org of selfOrgs) {
    const repos = await fetchRepositoriesFromOrg(org);
    // OG画像を取得して追加
    for (const repo of repos) {
      console.log(`Fetching OG image for ${repo.full_name}...`);
      const ogImage = await fetchOgImageForRepo(repo.full_name);
      repo.ogImage = ogImage;
      selfRepos.push(repo);
      // Webスクレイピングレート制限を回避するための遅延
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  // 他社組織
  for (const org of otherOrgs) {
    const repos = await fetchRepositoriesFromOrg(org);
    // OG画像を取得して追加
    for (const repo of repos) {
      console.log(`Fetching OG image for ${repo.full_name}...`);
      const ogImage = await fetchOgImageForRepo(repo.full_name);
      repo.ogImage = ogImage;
      otherRepos.push(repo);
      // Webスクレイピングレート制限を回避するための遅延
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
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
