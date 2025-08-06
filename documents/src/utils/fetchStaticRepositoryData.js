const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

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

async function fetchStaticRepositoryData() {
  const organizations = ["FairyDevicesRD"];

  let allRepos = [];

  for (const org of organizations) {
    console.log(`Fetching repositories for ${org}...`);
    const repos = await fetchRepositoriesFromOrg(org);
    console.log(`Found ${repos.length} repositories with "thinklet" topic.`);

    // OG画像を取得して追加
    for (const repo of repos) {
      console.log(`Fetching OG image for ${repo.full_name}...`);
      const ogImage = await fetchOgImageForRepo(repo.full_name);
      repo.ogImage = ogImage;

      allRepos.push(repo);

      // GitHub API レート制限を回避するための遅延
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const dataDir = path.join(__dirname, "../utils");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, "staticRepoData.json");

  fs.writeFileSync(outputPath, JSON.stringify(allRepos, null, 2));

  console.log(`repository data saved to ${outputPath}`);
}

fetchStaticRepositoryData().catch((error) => {
  console.error("Error in staticRepoData:", error);
  process.exit(1);
});
