import GhRepositoryList from "../GhRepository/GhRepositoryList";

const AccountRepositoriesTable = ({ accounts, repoData }) => {
  // thinkletタグのあるリポジトリのみをフィルタリング
  const filteredRepos = repoData.filter((repo) =>
    repo.topics.includes("thinklet")
  );

  // 配列で与えられたアカウントの順序でソート、同じアカウント内ではLast Push降順でソート
  const sortedRepos = filteredRepos.sort((a, b) => {
    const aIndex = accounts.indexOf(a.owner.login);
    const bIndex = accounts.indexOf(b.owner.login);
    const accountCompare = aIndex - bIndex;
    if (accountCompare !== 0) return accountCompare;
    // Last Push降順（新しい順）でソート（表示されているpushed_atに合わせる）
    return (b.pushed_at ? new Date(b.pushed_at).getTime() : 0) - (a.pushed_at ? new Date(a.pushed_at).getTime() : 0);
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

export default AccountRepositoriesTable;
