# 🔍 Why It Works

## ✅ 技術スタック
- Next.js (Reactベース)
- TypeScript
- Tailwind CSS
- Supabase (DB + Auth)

---

## ⚙ フロント側の仕組み

### 🌱 状態管理
- `useState` で `session`, `memos`, `isLoading`, `editTargetId` などの状態を管理します。
- `setSession` が呼ばれるとReactが再描画し、ログイン画面 ↔ メモ画面を切り替えます。
- `setMemos` が呼ばれるとメモ一覧が自動で更新されます。
- `isLoading` は、データ操作中のボタンの無効化（排他制御）に使われます。

### 🔁 セッション監視
- `useEffect` で `supabase.auth.getSession()` により初期状態を取得します。
- `onAuthStateChange` でログイン/ログアウトをリッスンし、`session` stateを更新することでUIを動的に変更します。

### 📝 CRUD操作とUIの同期
- **Read:** `useEffect` が `session` の変更を検知し、`fetchMemos` を呼び出してメモ一覧を取得・表示します。
- **Create/Update/Delete:** `handleAddMemo`, `handleUpdateMemo`, `handleConfirmDelete` の各関数内でデータ操作を行った後、再度 `fetchMemos` を呼び出します。
- これにより、`memos` stateが更新され、UIが自動的に最新の状態に再描画されます。この「データ操作 → データ再取得 → UI更新」という流れが、UIとデータベースの状態を同期させる基本的な仕組みです。

---

## ⚡ 再描画の流れ

| トリガ | 何が変わる？ | どうなる？ |
|---|---|---|
| `setSession` | `session` が更新 | `return` の if 条件が変わり、画面がログイン画面 ↔ メモ画面で切り替わる |
| `setMemos` | `memos` が更新 | メモ一覧が再描画される |
| `setIsLoading` | `isLoading` が更新 | 操作中のボタンが `disabled` になり、ユーザーの多重操作を防ぐ |

---

## 🔒 認証とDBの安全性
- Supabase の RLS (Row Level Security) により `auth.uid() = user_id` を適用しています。
- これにより、APIリクエストレベルで、認証されたユーザーは自分自身のメモしか操作できないことが保証されます。
- 認証情報は Supabase のセッションに自動保存（ブラウザローカル）されます。