const fetch = require("node-fetch");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");

class ZennRSSFetcher {
  constructor(publicationName) {
    this.publicationName = publicationName;
    this.rssUrl = `https://zenn.dev/p/${publicationName}/feed?all=1`;
  }

  async fetchRSS() {
    try {
      const response = await fetch(this.rssUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error("RSS取得エラー:", error);
      throw error;
    }
  }

  async parseRSS(xmlData) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
    });

    try {
      const result = await parser.parseStringPromise(xmlData);
      return result.rss.channel.item || [];
    } catch (error) {
      console.error("RSS解析エラー:", error);
      throw error;
    }
  }

  extractArticleData(items) {
    return items.map((item) => ({
      title: item.title,
      link: item.link,
      description:
        item.description?.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      pubDate: new Date(item.pubDate).toISOString().split("T")[0],
      author: item["dc:creator"] || "Unknown",
    }));
  }

  async getArticles(limit = 50) {
    const xmlData = await this.fetchRSS();
    const items = await this.parseRSS(xmlData);
    const articles = this.extractArticleData(items);
    return articles.slice(0, limit);
  }
}

function generateLinkCardComponent(articles) {
  return `export const zennArticleList = () => {
  const articles = ${JSON.stringify(articles, null, 2)};

  return articles;
};`;
}

async function main() {
  const publicationName = process.argv[2] || "your-publication-name";
  const outputDir = process.argv[3] || "./src/utils";

  console.log(`Zenn Publication "${publicationName}" の記事を取得中...`);

  try {
    const fetcher = new ZennRSSFetcher(publicationName);
    const articles = await fetcher.getArticles(50);

    console.log(`${articles.length}件の記事を取得しました`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const componentContent = generateLinkCardComponent(articles);
    fs.writeFileSync(
      path.join(outputDir, "zennArticleList.js"),
      componentContent
    );

    console.log("コンポーネントファイルを生成しました:");
    console.log(`- ${path.join(outputDir, "zennArticleList.js")}`);
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ZennRSSFetcher, generateLinkCardComponent };
