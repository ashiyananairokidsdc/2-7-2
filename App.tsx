
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { auth } from './firebase';
import Login from './Login';
import ChatWindow from './ChatWindow';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Access onAuthStateChanged directly from the auth instance to avoid import errors
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "名前なし",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || ""
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-400 rounded-full mb-4"></div>
          <p className="text-blue-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {!user ? (
        <Login onLoginSuccess={(u) => setUser(u)} />
      ) : (
        <ChatWindow user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
};

export default App;
