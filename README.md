# Notepad App（メモアプリ）

> **Next.js 15 / TypeScript / Tailwind CSS / Supabase** を組み合わせた最小構成の個人用メモアプリです。

---

## ✨ 特長

| 区分         | 詳細                                                           |
| ---------- | ------------------------------------------------------------ |
| **認証**     | Supabase のメールリンク認証（Magic Link）                               |
| **CRUD**   | メモの追加・一覧・編集・削除                                               |
| **スタイル**   | Tailwind CSS 3（Autoprefixer 連携）                              |
| **状態管理**   | React 19 フックのみ。外部ライブラリなし                                     |
| **データベース** | Postgres テーブル `memos`（id / user\_id / content / created\_at） |
| **拡張余地**   | タグ付け・pgvector 検索・PWA オフライン対応などを想定                            |

---

## 🚀 クイックスタート

```bash
# リポジトリを取得
$ git clone https://github.com/nyom3/notepad-app.git
$ cd notepad-app

# 依存ライブラリをインストール
$ npm install

# Supabase の URL とキーを設定
$ echo NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"   >> .env.local
$ echo NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."                >> .env.local

# 開発サーバー起動
$ npm run dev   # ▶ http://localhost:3000 にアクセス
```

---

## 📁 ディレクトリ構成（抜粋）

```
notepad-app/
├─ src/app/          # App Router ページ
│  ├─ page.tsx       # ログイン＋メモ UI
│  └─ globals.css
├─ lib/
│  └─ supabase.ts    # Supabase クライアントラッパー
├─ public/
├─ tailwind.config.ts
├─ postcss.config.js
└─ package.json
```

---

## 📜 npm スクリプト

| コマンド            | 目的                       |
| --------------- | ------------------------ |
| `npm run dev`   | 開発サーバー（HMR）              |
| `npm run build` | 本番ビルド生成                  |
| `npm run start` | 本番モード起動                  |
| `npm run lint`  | ESLint + TypeScript チェック |

---

## 🗄️ データベースセットアップ（Supabase）

```sql
-- 拡張を有効化（一度だけ）
create extension if not exists "uuid-ossp";

-- メモテーブル
create table if not exists memos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- RLS（行レベルセキュリティ）
alter table memos enable row level security;
create policy "自分のメモのみ参照" on memos
  for select using ( auth.uid() = user_id );
create policy "自分のメモのみ書込" on memos
  for all using ( auth.uid() = user_id );
```

上記 SQL を Supabase **SQL Editor** で実行して下さい。

---

## 🛣️ ロードマップ

* [ ] タグ付け・フィルタ UI
* [ ] pgvector を用いたセマンティック検索
* [ ] PWA オフラインキャッシュ
* [ ] GitHub Actions → Vercel デプロイ自動化

---

## 🖋️ ライセンス

MIT © 2025 nyom3
