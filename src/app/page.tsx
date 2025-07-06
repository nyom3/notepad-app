'use client';

import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memos, setMemos] = useState<any[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchMemos();
    }
  }, [session]);

  const handleSignUp = async () => {
    await supabase.auth.signUp({ email, password });
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchMemos = async () => {
    const { data } = await supabase.from('memos').select('*');
    setMemos(data || []);
  };

const handleAddMemo = async () => {
  if (!newMemo.trim() || !session) return;
  setIsLoading(true);
  try {
    const { error } = await supabase
      .from('memos')
      .insert([{ content: newMemo, user_id: session.user.id }]);
    if (error) throw error;
    setNewMemo('');
    await fetchMemos();
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

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
        <button onClick={handleAddMemo} className="bg-blue-500 text-white p-2 rounded-r">
          Add
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
