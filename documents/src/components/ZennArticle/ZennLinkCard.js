import React from "react";

import styles from "./ZennLinkCard.module.css";

const ZennLinkCard = ({ article }) => {
  return (
    <a
      href={article.link}
      className={styles.linkCard}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.description}>{article.description}</p>
        <div className={styles.meta}>
          <span className={styles.author}>by {article.author}</span>
          <span className={styles.date}>{article.pubDate}</span>
        </div>
      </div>
    </a>
  );
};

export default ZennLinkCard;
