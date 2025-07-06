'use client';

import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabaseクライアントを初期化します。環境変数からURLと匿名キーを読み込みます。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ホーム画面のメインコンポーネントです。
 * ユーザー認証、メモの表示、追加、ログアウト機能を提供します。
 */
export default function Home() {
  // 認証セッションの状態を管理します。
  const [session, setSession] = useState<any>(null);
  // メールアドレス入力フィールドの状態を管理します。
  const [email, setEmail] = useState('');
  // パスワード入力フィールドの状態を管理します。
  const [password, setPassword] = useState('');
  // メモのリストの状態を管理します。
  const [memos, setMemos] = useState<any[]>([]);
  // 新規メモ入力フィールドの状態を管理します。
  const [newMemo, setNewMemo] = useState('');
  // データロード中の状態を管理します。
  const [isLoading, setIsLoading] = useState(false);

  /**
   * コンポーネントのマウント時に一度だけ実行されます。
   * 現在のセッションを取得し、認証状態の変更を監視します。
   */
  useEffect(() => {
    // 現在の認証セッションを取得してstateに設定します。
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // 認証状態（サインイン、サインアウトなど）の変更をリッスンします。
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // コンポーネントがアンマウントされる際にリスナーを解除します。
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * session の状態が変更されたときに実行されます。
   * ユーザーがログインしたら、メモを取得します。
   */
  useEffect(() => {
    if (session) {
      fetchMemos();
    }
  }, [session]);

  /**
   * 新規ユーザー登録を処理します。
   */
  const handleSignUp = async () => {
    await supabase.auth.signUp({ email, password });
  };

  /**
   * ユーザーのログインを処理します。
   */
  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  /**
   * ユーザーのログアウトを処理します。
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  /**
   * Supabaseから現在のユーザーのメモを取得し、stateを更新します。
   */
  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*');
    setMemos(data || []);
  };

  /**
   * 新しいメモを追加します。
   */
  const handleAddMemo = async () => {
    // メモが空、またはセッションがない場合は何もしません。
    if (!newMemo.trim() || !session) return;
    setIsLoading(true);
    try {
      // Supabaseの'memos'テーブルに新しいメモを挿入します。
      const { error } = await supabase
        .from('memos')
        .insert([{ content: newMemo, user_id: session.user.id }]);
      if (error) throw error;
      setNewMemo(''); // 入力フィールドをクリアします。
      await fetchMemos(); // メモリストを再取得して表示を更新します。
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // セッションがない場合（未ログイン状態）は、ログイン/サインアップフォームを表示します。
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded mr-2">
          Login
        </button>
        <button onClick={handleSignUp} className="bg-green-500 text-white p-2 rounded">
          Sign Up
        </button>
      </div>
    );
  }

  // セッションがある場合（ログイン済み状態）は、メモ帳アプリケーションのメイン画面を表示します。
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Your Memos</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded mb-4">
        Logout
      </button>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="New memo"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          className="p-2 border rounded-l"
        />
        <button onClick={handleAddMemo} className="bg-blue-500 text-white p-2 rounded-r" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
      <ul>
        {memos.map((memo) => (
          <li key={memo.id} className="border-b p-2">
            {memo.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
