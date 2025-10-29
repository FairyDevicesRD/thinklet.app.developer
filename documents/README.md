# Website
このウェブサイトは、[Docusaurus](https://docusaurus.io/)を使用した静的ウェブサイトジェネレーターで動作します。  
テックブログ記事一覧は、ZennのRSSフィードからpublication内の記事情報を取得しています。取得した記事の内、`"android", "thinklet", "kotlin"`の単語がタイトルに含まれる記事を表示しています。

## Installation
- [bun](https://bun.sh/)

### Local Development

```console
$ bun install
# ZennのRSSフィードからpublication内の記事情報を取得します。
$ ZENN_PUBLICATION_NAME=<publication-name> bun run fetch-zenn-articles
# THINKLETアプリOSSの情報を取得します。
# selfOrgs: 自社組織 otherOrgs: パートナー組織(カンマ区切りで複数指定)
$ bun run fetch-repository --selfOrgs FairyDevicesRD --otherOrgs playbox-dev,function-transportation
$ bun run start
```

### Build

```console
# ZennのRSSフィードからpublication内の記事情報を取得します。
$ ZENN_PUBLICATION_NAME=<publication-name> bun run fetch-zenn-articles
# THINKLETアプリOSSの情報を取得します。
# selfOrgs: 自社組織 otherOrgs: パートナー組織(カンマ区切りで複数指定)
$ bun run fetch-repository --selfOrgs FairyDevicesRD --otherOrgs playbox-dev,function-transportation
$ bun run build
```
