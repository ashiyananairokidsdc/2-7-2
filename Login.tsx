
import React, { useState } from 'react';
import { UserProfile } from './types';
import { loginWithGoogle } from './firebase';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      // Firebaseのエラーコードに応じてメッセージを分岐
      if (err.code === 'auth/unauthorized-domain') {
        setError("このドメインからのログインが許可されていません。Firebaseコンソールの「承認済みドメイン」にこのURLを追加してください。");
      } else if (err.code === 'auth/popup-blocked') {
        setError("ポップアップがブロックされました。ブラウザの設定で許可してください。");
      } else {
        setError(`ログインに失敗しました: ${err.message || "時間を置いて再度お試しください"}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-teal-50 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-10 border border-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center leading-tight">なないろ歯科・こども矯正歯科</h1>
          <div className="mt-2 px-4 py-1 bg-blue-50 rounded-full">
            <p className="text-blue-600 font-bold text-sm tracking-widest">芦屋医院 院内チャット</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-700 text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm group disabled:opacity-50"
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-bold text-slate-700">{isLoggingIn ? "ログイン中..." : "Googleアカウントでログイン"}</span>
        </button>

        <p className="mt-10 text-center text-slate-400 text-xs leading-relaxed">
          院内関係者以外はご利用いただけません<br/>
          （スタッフ専用アカウントでログインしてください）
        </p>
      </div>
    </div>
  );
};

export default Login;
