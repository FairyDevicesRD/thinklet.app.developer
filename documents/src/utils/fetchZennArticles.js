const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
const { keywords } = require("./ZennArticlesKeywords");

const fetch = globalThis.fetch;

class ZennAPIFetcher {
  constructor(publicationName, cacheFilePath) {
    this.publicationName = publicationName;
    this.apiBaseUrl = "https://zenn.dev/api";
    this.cacheFilePath = cacheFilePath;
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const cacheData = fs.readFileSync(this.cacheFilePath, "utf-8");
        return JSON.parse(cacheData);
      }
    } catch (error) {
      console.warn("キャッシュの読み込みに失敗しました:", error.message);
    }
    return {};
  }

  saveCache() {
    try {
      const dir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.cacheFilePath,
        JSON.stringify(this.cache, null, 2)
      );
      console.log(`キャッシュを保存しました: ${this.cacheFilePath}`);
    } catch (error) {
      console.error("キャッシュの保存に失敗しました:", error.message);
    }
  }

  async fetchArticleList() {
    try {
      let allArticles = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const url =
          page === 1
            ? `${this.apiBaseUrl}/articles?publication_name=${this.publicationName}`
            : `${this.apiBaseUrl}/articles?publication_name=${this.publicationName}&page=${page}`;

        console.log(`記事一覧を取得中 (ページ${page}): ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const articles = data.articles || [];
        allArticles = allArticles.concat(articles);

        if (data.next_page) {
          page = data.next_page;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          hasNextPage = false;
        }
      }

      console.log(`全${allArticles.length}件の記事を取得しました`);
      return allArticles;
    } catch (error) {
      console.error("記事一覧の取得エラー:", error);
      throw error;
    }
  }

  async fetchArticleDetail(slug, bodyUpdatedAt) {
    const cacheKey = slug;
    if (
      this.cache[cacheKey] &&
      this.cache[cacheKey].body_updated_at === bodyUpdatedAt
    ) {
      console.log(`キャッシュを使用: ${slug}`);
      return this.cache[cacheKey];
    }

    try {
      const url = `${this.apiBaseUrl}/articles/${slug}`;
      console.log(`記事詳細を取得中: ${slug}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const article = data.article;

      this.cache[cacheKey] = {
        slug: article.slug,
        body_updated_at: article.body_updated_at,
        topics: article.topics || [],
        body_html: article.body_html || "",
      };

      // API レート制限対策
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return this.cache[cacheKey];
    } catch (error) {
      console.error(`記事詳細の取得エラー (${slug}):`, error.message);
      return null;
    }
  }

  matchesKeywords(article) {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());
    const topicNames = (article.topics || []).map((topic) =>
      topic.name.toLowerCase()
    );
    const lowerTitle = article.title.toLowerCase();

    return lowerKeywords.some(
      (keyword) =>
        topicNames.includes(keyword) || lowerTitle.includes(keyword)
    );
  }

  async getFilteredArticles(limit = 100) {
    try {
      const articleList = await this.fetchArticleList();
      const filteredArticles = [];

      console.log(`${articleList.length}件の記事を取得しました`);

      for (const article of articleList) {
        const detail = await this.fetchArticleDetail(
          article.slug,
          article.body_updated_at
        );

        if (detail) {
          const enrichedArticle = {
            ...article,
            topics: detail.topics,
          };

          if (this.matchesKeywords(enrichedArticle)) {
            const bodyText = (detail.body_html || "")
              .replace(/<[^>]*>/g, "")
              .replace(/\s+/g, " ")
              .trim();
            const description =
              bodyText.substring(0, 150) + (bodyText.length > 150 ? "..." : "");

            filteredArticles.push({
              title: article.title,
              link: article.path
                ? `https://zenn.dev${article.path}`
                : `https://zenn.dev/${this.publicationName}/articles/${article.slug}`,
              emoji: article.emoji || "",
              description: description,
              pubDate: new Date(article.published_at)
                .toISOString()
                .split("T")[0],
              author: article.user?.name || "Unknown",
            });
          }
        }

        if (filteredArticles.length >= limit) {
          break;
        }
      }

      this.saveCache();

      return filteredArticles;
    } catch (error) {
      console.error("フィルタリング済み記事の取得に失敗:", error.message);
      throw error;
    }
  }
}

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

  matchesKeywords(item) {
    const title = (item.title || "").toLowerCase();
    return keywords.some((keyword) => title.includes(keyword.toLowerCase()));
  }

  extractArticleData(items) {
    return items
      .filter((item) => this.matchesKeywords(item))
      .map((item) => ({
        title: item.title,
        link: item.link,
        emoji: "",
        description:
          item.description?.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
        pubDate: new Date(item.pubDate).toISOString().split("T")[0],
        author: item["dc:creator"] || "Unknown",
      }));
  }

  async getArticles(limit) {
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
  const publicationName = process.env.ZENN_PUBLICATION_NAME;
  if (!publicationName) {
    console.error("エラー: Zennのpublication名を指定してください。");
    console.error(
      "ZENN_PUBLICATION_NAME=<publication-name> bun run src/utils/fetchZennArticles.js"
    );
    process.exit(1);
  }
  const outputDir = process.argv[3] || "./src/utils";
  const cacheFilePath = path.join(outputDir, "zennArticlesCache.json");

  console.log(`Zenn Publication "${publicationName}" の記事を取得中...`);
  console.log(`キーワードフィルター: ${keywords.join(", ")}`);

  let apiArticles = [];
  let rssArticles = [];

  try {
    console.log("\n=== Zenn API を使用した取得 ===");
    const apiFetcher = new ZennAPIFetcher(publicationName, cacheFilePath);
    apiArticles = await apiFetcher.getFilteredArticles(100);
    console.log(`APIから ${apiArticles.length} 件のフィルタリング済み記事を取得`);
  } catch (apiError) {
    console.error("API取得に失敗しました:", apiError.message);
  }

  try {
    console.log("\n=== RSS フィードを使用した取得 ===");
    const rssFetcher = new ZennRSSFetcher(publicationName);
    rssArticles = await rssFetcher.getArticles(100);
    console.log(`RSSから ${rssArticles.length} 件のフィルタリング済み記事を取得`);
  } catch (rssError) {
    console.error("RSS取得に失敗しました:", rssError.message);
  }

  if (apiArticles.length === 0 && rssArticles.length === 0) {
    console.error("エラー: APIとRSSの両方から記事を取得できませんでした");
    process.exit(1);
  }

  console.log("\n=== 記事をマージ中 ===");
  const mergedArticles = mergeArticles(apiArticles, rssArticles);
  console.log(`マージ後: ${mergedArticles.length} 件の記事`);

  if (mergedArticles.length === 0) {
    console.warn("警告: フィルタリング後の記事が0件です");
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const componentContent = generateLinkCardComponent(mergedArticles);
  fs.writeFileSync(
    path.join(outputDir, "zennArticleList.js"),
    componentContent
  );

  console.log("\n✓ コンポーネントファイルを生成しました:");
  console.log(`  - ${path.join(outputDir, "zennArticleList.js")}`);
  console.log(`  - ${mergedArticles.length} 件の記事を出力`);
}

function mergeArticles(apiArticles, rssArticles) {
  const articleMap = new Map();

  for (const article of apiArticles) {
    articleMap.set(article.link, article);
  }

  for (const article of rssArticles) {
    if (!articleMap.has(article.link)) {
      articleMap.set(article.link, article);
    }
  }

  return Array.from(articleMap.values()).sort((a, b) => {
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  });
}

module.exports = {
  ZennAPIFetcher,
  ZennRSSFetcher,
  generateLinkCardComponent,
};
