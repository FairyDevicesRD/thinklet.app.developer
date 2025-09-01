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
$ bun run start
```

### Build

```console
# ZennのRSSフィードからpublication内の記事情報を取得します。
$ ZENN_PUBLICATION_NAME=<publication-name> bun run fetch-zenn-articles
$ bun run build
```
