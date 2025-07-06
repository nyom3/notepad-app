# 更新履歴

## 2025-07-06: メモの削除機能の実装とCRUD完了

### 概要

メモの削除機能（Delete）を実装し、基本的なCRUD（Create, Read, Update, Delete）操作がすべて可能になりました。ユーザーが誤ってメモを削除しないよう、削除前に確認モーダルを表示する機能も追加しています。

### 変更点

1.  **メモ削除機能:**
    -   各メモに「Delete」ボタンを設置しました。
    -   ボタンクリックで、Supabaseの`memos`テーブルから対象のレコードを削除します。

2.  **削除確認モーダル:**
    -   「Delete」ボタンを押すと、本当に削除してよいかを確認するモーダルウィンドウが表示されます。
    -   「OK」を押すと削除が実行され、「キャンセル」を押すと操作が中断されます。

3.  **READMEの更新:**
    -   CRUD機能の実装が完了したことを反映し、READMEの該当項目を更新しました。

### ソースコードの差分

```diff
diff --git a/src/app/page.tsx b/src/app/page.tsx
index 86afe8c..f5fe1d6 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -28,6 +28,9 @@ export default function Home() {
   // 編集対象のメモIDを保持する状態
   // Editボタンが押されるとこのIDがセットされ、Updateモードになる
   const [editTargetId, setEditTargetId] = useState<string | null>(null);
+  // 削除確認モーダルの表示状態と対象IDを管理
+  const [showDeleteModal, setShowDeleteModal] = useState(false);
+  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
 
   /**
    * コンポーネントのマウント時に一度だけ実行されます。
@@ -157,6 +160,42 @@ export default function Home() {
     setEditTargetId(null);
   };
 
+  // handleDeleteMemoをモーダル用に分割
+  // 削除ボタン押下時にモーダルを表示
+  const handleDeleteClick = (memoId: string) => {
+    setDeleteTargetId(memoId);
+    setShowDeleteModal(true);
+  };
+
+  // モーダルでOK時の削除処理
+  const handleConfirmDelete = async () => {
+    if (!session || !deleteTargetId) {
+      setShowDeleteModal(false);
+      return;
+    }
+    setIsLoading(true);
+    setShowDeleteModal(false);
+    try {
+      const { error } = await supabase
+        .from('memos')
+        .delete()
+        .eq('id', deleteTargetId);
+      if (error) throw error;
+      await fetchMemos();
+    } catch (err) {
+      console.error(err);
+    } finally {
+      setIsLoading(false);
+      setDeleteTargetId(null);
+    }
+  };
+
+  // モーダルでキャンセル時
+  const handleCancelDelete = () => {
+    setShowDeleteModal(false);
+    setDeleteTargetId(null);
+  };
+
   // セッションがない場合（未ログイン状態）は、ログイン/サインアップフォームを表示します。
   if (!session) {
     return (
@@ -234,10 +273,41 @@ export default function Home() {
             >
               Edit
             </button>
+            {/* 削除ボタンを追加 */}
+            <button
+              onClick={() => handleDeleteClick(memo.id)}
+              className="bg-red-500 text-white p-1 rounded"
+            >
+              Delete
+            </button>
             {memo.content}
           </li>
         ))}
       </ul>
+      {/* 削除確認モーダル */}
+      {showDeleteModal && (
+        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
+          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
+            <p className="mb-4">本当にこのメモを削除しますか？</p>
+            <div className="flex gap-4">
+              <button
+                onClick={handleConfirmDelete}
+                className="bg-red-500 text-white px-4 py-2 rounded"
+                disabled={isLoading}
+              >
+                OK
+              </button>
+              <button
+                onClick={handleCancelDelete}
+                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
+                disabled={isLoading}
+              >
+                キャンセル
+              </button>
+            </div>
+          </div>
+        </div>
+      )}
     </div>
   );
 }
```

## 2025-07-06: メモの編集・更新機能の改善

### 概要

`page.tsx`に実装されたメモの編集・更新機能に対して、ユーザー体験の向上とコードの堅牢性を高めるための修正を行いました。

### 変更点

1.  **編集中メモのハイライト表示:**
    -   ユーザーがどのメモを編集中か視覚的に分かりやすくするため、編集対象のメモの背景色を黄色に変更するようにしました。

2.  **編集キャンセル機能の追加:**
    -   誤って編集を開始してしまった場合や、編集をやめたい場合に、操作を中断できる「Cancel」ボタンを追加しました。

3.  **データ更新処理の堅牢性向上:**
    -   メモの追加・更新時に、データベースへの反映が成功した場合にのみ入力フォームをクリアするように処理順序を修正しました。これにより、通信エラー等で更新が失敗した際に、入力内容が消えてしまうのを防ぎます。

### ソースコードの差分

```diff
diff --git a/src/app/page.tsx b/src/app/page.tsx
index 8f91348..86afe8c 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -4,7 +4,7 @@ import { useEffect, useState } from 'react';
 import { createClient, SupabaseClient } from '@supabase/supabase-js';
 
 // Supabaseクライアントを初期化します。環境変数からURLと匿名キーを読み込みます。
-const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
+const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
 const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
 const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
 /**
@@ -25,13 +25,17 @@ export default function Home() {
   const [newMemo, setNewMemo] = useState('');
   // データロード中の状態を管理します。
   const [isLoading, setIsLoading] = useState(false);
+  // 編集対象のメモIDを保持する状態
+  // Editボタンが押されるとこのIDがセットされ、Updateモードになる
+  const [editTargetId, setEditTargetId] = useState<string | null>(null);
 
   /**
    * コンポーネントのマウント時に一度だけ実行されます。
    * 現在のセッションを取得し、認証状態の変更を監視します。
    */
   useEffect(() => {
-    // 現在の認証セッションを取得してstateに設定します。
+    // ページ初期表示時にセッションを取得し、stateにセット。
+    // これによりReactが再描画し、ログイン画面 or メモ画面が切り替わる。
     const getSession = async () => {
       const { data } = await supabase.auth.getSession();
       setSession(data.session);
@@ -83,13 +87,24 @@ export default function Home() {
   };
 
   /**
-   * Supabaseから現在のユーザーのメモを取得し、stateを更新します。
+    * Supabaseから現在のユーザーのメモを取得し、memos stateを更新します。
+    * このstateが変わることでReactが自動的に再描画を行います。
    */
   const fetchMemos = async () => {
     const { data } = await supabase.from('memos').select('*');
     setMemos(data || []);
   };
 
+  /**
+   * メモの編集を開始します。
+   * Editボタンが押されたとき、対象のメモ内容を入力欄にセットし、
+   * editTargetId にそのメモのidをセットすることでUpdateモードにします。
+   */
+  function handleEditMemo(memoId: string, content: string) {
+    setNewMemo(content); // 入力欄に編集対象のメモ内容をセット
+    setEditTargetId(memoId); // 編集対象のメモIDをセット
+  }
+
   /**
    * 新しいメモを追加します。
    */
@@ -103,8 +118,30 @@ export default function Home() {
         .from('memos')
         .insert([{ content: newMemo, user_id: session.user.id }]);
       if (error) throw error;
+      await fetchMemos(); // メモリストを再取得して表示を更新します。
       setNewMemo(''); // 入力フィールドをクリアします。
+    } catch (err) {
+      console.error(err);
+    } finally {
+      setIsLoading(false);
+    }
+  };
+
+  /**
+   * メモを更新します。
+   */
+  const handleUpdateMemo = async () => {
+    if (!editTargetId || !newMemo.trim() || !session) return;
+    setIsLoading(true);
+    try {
+      const { error } = await supabase
+        .from('memos')
+        .update({ content: newMemo })
+        .eq('id', editTargetId);
+      if (error) throw error;
       await fetchMemos(); // メモリストを再取得して表示を更新します。
+      setNewMemo(''); // 入力フィールドをクリアします。
+      setEditTargetId(null); // 編集対象IDをリセットします。
     } catch (err) {
       console.error(err);
     } finally {
@@ -112,6 +149,14 @@ export default function Home() {
     }
   };
 
+  /**
+   * 編集をキャンセルします。
+   */
+  const handleCancelEdit = () => {
+    setNewMemo('');
+    setEditTargetId(null);
+  };
+
   // セッションがない場合（未ログイン状態）は、ログイン/サインアップフォームを表示します。
   if (!session) {
     return (
@@ -156,13 +201,39 @@ export default function Home() {
           onChange={(e) => setNewMemo(e.target.value)}
           className="p-2 border rounded-l"
         />
-        <button onClick={handleAddMemo} className="bg-blue-500 text-white p-2 rounded-r" disabled={isLoading}>
-          {isLoading ? 'Adding...' : 'Add'}
+        <button
+          onClick={editTargetId ? handleUpdateMemo : handleAddMemo}
+          className="bg-blue-500 text-white p-2 rounded-r"
+          disabled={isLoading}
+        >
+          {isLoading
+            ? editTargetId ? 'Updating...' : 'Adding...'
+            : editTargetId ? 'Update' : 'Add'}
         </button>
+        {editTargetId && (
+          <button
+            onClick={handleCancelEdit}
+            className="bg-gray-500 text-white p-2 rounded-r ml-2"
+          >
+            Cancel
+          </button>
+        )}
       </div>
       <ul>
         {memos.map((memo) => (
-          <li key={memo.id} className="border-b p-2">
+          <li
+            key={memo.id}
+            className={`border-b p-2 ${
+              editTargetId === memo.id ? 'bg-yellow-200' : ''
+            }`}
+          >
+            {/* 編集ボタンを追加 */}
+            <button
+              onClick={() => handleEditMemo(memo.id, memo.content)}
+              className="bg-yellow-500 text-white p-1 rounded mr-2"
+            >
+              Edit
+            </button>
             {memo.content}
           </li>
         ))}
      </ul>

```