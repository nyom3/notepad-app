# 🔍 Why It Works

## ✅ 技術スタック
- Next.js (Reactベース)
- TypeScript
- Tailwind CSS
- Supabase (DB + Auth)

---

## ⚙ フロント側の仕組み

### 🌱 状態管理
- `useState` で `session` と `memos` を管理
- `setSession` が呼ばれると React が再描画し、ログイン画面 ↔ メモ画面を切り替え
- `setMemos` が呼ばれると一覧が自動で更新

### 🔁 セッション監視
- `useEffect #1` で `supabase.auth.getSession()` により初期状態を取得
- `onAuthStateChange` でログイン/ログアウトを監視
- 結果は `session` にセット → 再描画

### 📝 メモ取得
- `useEffect #2` で `session` が入った瞬間だけ `fetchMemos` を呼び一覧を取得
- メモ追加時は `handleAddMemo` 内で直接 `fetchMemos` を再呼び出し

---

## ⚡ 再描画の流れ
| トリガ | 何が変わる？ | どうなる？ |
|---|---|---|
| `setSession` | `session` が更新 | `return` の if 条件が変わり、画面がログイン画面 ↔ メモ画面で切り替わる |
| `setMemos` | `memos` が更新 | メモ一覧が再描画される |

---

## 🔒 認証とDBの安全性
- Supabase の RLS (Row Level Security) により `auth.uid() = user_id` を適用
- ログインしていないとデータ取得不可
- 認証情報は Supabase のセッションに自動保存（ブラウザローカル）

---

## 📝 今後想定する理由追加
- CRUD の `Edit` / `Delete` でも同じ仕組みで `setMemos` を更新予定
- 排他制御を `isProcessing` で一括管理し UX 向上
