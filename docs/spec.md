# 📜 Notepad App - Specification

## ✅ 概要
- Next.js + TypeScript + Tailwind CSS + Supabase を使ったシンプルなメモアプリ。
- ユーザー認証、メモの作成・取得をサポート。

---

## 🗂 データベース構成（Supabase）
### memos テーブル
| カラム名     | 型         | 説明                     |
|-------------|------------|--------------------------|
| uuid        | uuid       | 主キー                   |
| user_id     | uuid       | ユーザーのID（auth.uid） |
| content     | text       | メモ本文                 |
| created_at  | timestamp  | 作成日時                 |

- RLS: `auth.uid() = user_id` を適用し、ユーザー自身のデータのみ操作可能。

---

## 🔑 認証
- Supabase Auth (Email + Password)
- `getSession`, `onAuthStateChange` を使ってセッション監視

---

## 🖥 フロント実装
- `/pages/page.tsx` に
  - ログイン画面 / メモ画面の条件分岐
  - `useEffect` による初期セッション取得、Auth監視
  - メモの `fetchMemos`, `handleAddMemo`

---

## 🚀 TODO
- Edit / Delete のCRUD機能を追加
- メモ操作中はボタンを排他制御
- eslint, prettierの自動整備
- Github Actionsでテスト・Lint

---

## 💡 Why it works
→ `/docs/why-it-works.md` に詳述予定
