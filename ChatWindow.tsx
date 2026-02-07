
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from './types';
import { subscribeMessages, sendMessage, logout, markAsRead } from './firebase';
import MessageItem from './MessageItem';
import { GoogleGenAI } from "@google/genai";

interface ChatWindowProps {
  user: UserProfile;
  onLogout: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // リアルタイム購読の開始
  useEffect(() => {
    const unsubscribe = subscribeMessages((newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, []);

  // スクロール制御と既読処理
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // 届いたメッセージの中で自分がまだ読んでいないものを既読にする
    messages.forEach(m => {
      if (!m.readBy.includes(user.uid)) {
        markAsRead(m.id, user.uid);
      }
    });
  }, [messages, user.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    const importantStatus = isImportant;
    
    setInputText('');
    setIsImportant(false);
    
    try {
      await sendMessage(user, textToSend, importantStatus);
    } catch (err) {
      console.error("送信エラー:", err);
      alert("送信に失敗しました。ネット接続を確認してください。");
    }
  };

  const handleSummarize = async () => {
    if (messages.length === 0) {
      alert("要約するメッセージがありません。");
      return;
    }
    
    setIsSummarizing(true);
    try {
      // Fix: Create GoogleGenAI instance inside the handler to use latest process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // 直近20件程度のやり取りを要約対象にする
      const recentContext = messages.slice(-20).map(m => `${m.senderName}: ${m.text}`).join('\n');
      
      // Fix: Use systemInstruction in config and separate user prompt from system prompt
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `チャット履歴:\n\n${recentContext}`,
        config: {
          systemInstruction: "あなたは歯科医院の優秀な秘書です。スタッフ間のチャット履歴を簡潔に要約し、重要な指示や決定事項を箇条書きで伝えてください。",
        }
      });

      // Fix: Use .text property instead of text() method
      const resultText = response.text;
      if (resultText) {
        alert(`【AIによるチャット要約】\n\n${resultText}`);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      console.error("AIエラー:", err);
      alert("AI要約が現在利用できません。Vercelの設定でAPI_KEYが正しく登録されているか確認してください。");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">な</div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tighter">なないろ歯科 芦屋医院</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {user.displayName} でログイン中
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSummarize} 
            disabled={isSummarizing}
            title="AIで要約"
            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30"
          >
            {isSummarizing ? (
              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
          <button onClick={() => { logout(); onLogout(); }} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} isMe={msg.senderId === user.uid} />
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center">
            <button 
              type="button" 
              onClick={() => setIsImportant(!isImportant)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                isImportant 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-100' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {isImportant ? '重要メッセージ送信中' : '重要としてマーク'}
            </button>
          </div>
          <div className="flex gap-3 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-4 bg-slate-100 rounded-3xl border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none max-h-40 text-sm"
              placeholder="メッセージを入力..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-20 transition-all shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
