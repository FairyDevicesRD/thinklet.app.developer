import GhRepositoryList from "../GhRepository/GhRepositoryList";

const OrgRepositoriesTable = ({ orgs, repoData }) => {
  // thinkletタグのあるリポジトリのみをフィルタリング
  const filteredRepos = repoData.filter((repo) =>
    repo.topics.includes("thinklet")
  );

  // 配列で与えられた組織の順序でソート、同じ組織内ではリポジトリ名でソート
  const sortedRepos = filteredRepos.sort((a, b) => {
    const aIndex = orgs.indexOf(a.owner.login);
    const bIndex = orgs.indexOf(b.owner.login);
    const orgCompare = aIndex - bIndex;
    if (orgCompare !== 0) return orgCompare;
    return a.name.localeCompare(b.name);
  });

  return (
    <table>
      <thead>
        <tr>
          <th>ℹ️ Description</th>
          <th>🔗 URL</th>
          <th>📅 Last Updated</th>
          <th>⚖️ LICENSE</th>
          <th>🖼️ Preview</th>
        </tr>
      </thead>
      <tbody>
        {sortedRepos.map((repo) => (
          <GhRepositoryList key={repo.id} item={repo} />
        ))}
      </tbody>
    </table>
  );
};

export default OrgRepositoriesTable;
