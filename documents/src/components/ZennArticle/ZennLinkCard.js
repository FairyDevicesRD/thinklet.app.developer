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
        <div className={styles.cardHeader}>
          <h3 className={styles.title}>{article.title}</h3>
          <p className={styles.description}>
            {article.emoji && (
              <span aria-hidden="true">{article.emoji} </span>
            )}
            {article.description}
          </p>
        </div>
        <div className={styles.meta}>
          <span className={styles.author}>by {article.author}</span>
          <span className={styles.date}>{article.pubDate}</span>
        </div>
      </div>
    </a>
  );
};

export default ZennLinkCard;
