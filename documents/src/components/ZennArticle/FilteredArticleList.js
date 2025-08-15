import React from "react";
import Translate from "@docusaurus/Translate";
import ZennLinkCard from "./ZennLinkCard";
import { zennArticleList } from "../../utils/zennArticleList";

import styles from "./ZennLinkCard.module.css";

const FilteredArticleList = () => {
  const articles = zennArticleList();
  const filteredArticles = articles.filter((article) => {
    const title = article.title.toLowerCase();
    const keywords = ["android", "thinklet", "kotlin"];
    return keywords.some((keyword) => title.includes(keyword));
  });
  return (
    <section className={styles.usageBanner}>
      <h3>
        <Translate
          id="homepage.link.card"
          description="Zenn article link card title"
        />
      </h3>
      <div className={styles.articleGrid}>
        {filteredArticles.map((article, index) => (
          <ZennLinkCard key={article.link} article={article} />
        ))}
      </div>
    </section>
  );
};

export default FilteredArticleList;
