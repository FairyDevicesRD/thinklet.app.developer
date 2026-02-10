import React from "react";
import Translate from "@docusaurus/Translate";
import ZennLinkCard from "./ZennLinkCard";
import { zennArticleList } from "@site/src/utils/zennArticleList";
import styles from "./ZennLinkCard.module.css";

const FilteredArticleList = () => {
  const articles = zennArticleList();
  return (
    <section className={styles.usageBanner}>
      <h3>
        <Translate
          id="homepage.blog.card"
          description="Zenn article link card title"
        />
      </h3>
      <div className={styles.articleGrid}>
        {articles.map((article, index) => (
          <ZennLinkCard key={article.link} article={article} />
        ))}
      </div>
    </section>
  );
};

export default FilteredArticleList;
