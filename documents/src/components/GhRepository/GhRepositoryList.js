import styles from "./styles.module.css";

const GhRepositoryList = ({ item }) => {
  return (
    <tr key={item.id || item.node_id || item.full_name}>
      <td>{item.description}</td>
      <td>
        <a href={item.html_url} target="_blank" rel="noopener noreferrer">
          {item.full_name}
        </a>
      </td>
      <td>{new Date(item.pushed_at).toLocaleDateString()}</td>
      <td>{convertLicense(item)}</td>
      <td>
        <a href={item.html_url} target="_blank" rel="noopener noreferrer">
          <img
            src={
              item.ogImage ||
              `https://raw.githubusercontent.com/${item.full_name}/${item.defaultBranch}/.github/social-preview.png`
            }
            alt={`Preview of ${item.name || item.full_name.split("/")[1]}`}
            className={styles.previewImage}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://opengraph.githubassets.com/1/${item.full_name}`;
            }}
          />
        </a>
      </td>
    </tr>
  );
};

export default GhRepositoryList;

function convertLicense(item) {
  if (item.license?.name == null || item.license?.url == null) {
    return (
      <a href={item.html_url} target="_blank" rel="noopener noreferrer">
        See Repository
      </a>
    );
  } else {
    return item.license.name;
  }
}
