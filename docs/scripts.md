# スクリプトリファレンス

## 開発・デプロイ

| コマンド | 説明 |
|---|---|
| `pnpm dev` | ローカル開発サーバーを起動する |
| `pnpm deploy` | Cloudflare Workers へデプロイする（コード圧縮あり） |
| `pnpm cf-typegen` | Cloudflare Bindings の TypeScript 型定義を生成する |

```bash
# ローカルで動作確認
pnpm dev

# 本番へデプロイ
pnpm deploy
```

---

## コード品質

| コマンド | 説明 |
|---|---|
| `pnpm lint` | 静的解析のみ（修正なし） |
| `pnpm format` | フォーマットのみ自動修正 |
| `pnpm check` | 静的解析＋自動修正をまとめて実行 |

```bash
# CIなど修正せず確認だけしたいとき
pnpm lint

# コミット前にまとめて整形
pnpm check
```

---

## R2（オブジェクトストレージ）

| コマンド | 説明 |
|---|---|
| `pnpm r2:list` | バケット一覧を表示 |
| `pnpm r2:create <bucket-name>` | バケットを作成 |
| `pnpm r2:delete <bucket-name>` | バケットを削除 |

```bash
pnpm r2:list
pnpm r2:create my-bucket
pnpm r2:delete my-bucket
```

---

## D1（SQLiteデータベース）

| コマンド | 説明 |
|---|---|
| `pnpm d1:list` | データベース一覧を表示 |
| `pnpm d1:create <db-name>` | データベースを作成 |
| `pnpm d1:migrate` | マイグレーションを適用 |
| `pnpm d1:query` | SQLを直接実行 |

```bash
pnpm d1:list
pnpm d1:create my-db

# マイグレーション（--local でローカルのみ、--remote で本番）
pnpm d1:migrate --database-id=xxxx --local
pnpm d1:migrate --database-id=xxxx --remote

# SQL直接実行
pnpm d1:query --database-id=xxxx --command="SELECT * FROM users"
```

---

## KV（キーバリューストア）

| コマンド | 説明 |
|---|---|
| `pnpm kv:list` | Namespace 一覧を表示 |
| `pnpm kv:create <name>` | Namespace を作成 |
| `pnpm kv:put <key> <value>` | 値を保存 |
| `pnpm kv:get <key>` | 値を取得 |
| `pnpm kv:delete <key>` | 値を削除 |

```bash
pnpm kv:list
pnpm kv:create MY_KV

# 値の操作（--namespace-id が必要）
pnpm kv:put --namespace-id=xxxx mykey "myvalue"
pnpm kv:get --namespace-id=xxxx mykey
pnpm kv:delete --namespace-id=xxxx mykey
```

---

## 型定義の再生成タイミング

以下の変更を行ったあとは `pnpm cf-typegen` を実行する。

- `wrangler.toml` に R2 / D1 / KV の binding を追加・変更したとき
- 新しい環境変数を追加したとき