
import React from 'react';
import { Message } from './types';

interface MessageItemProps {
  message: Message;
  isMe: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isMe }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <img 
          src={message.senderPhoto} 
          alt={message.senderName} 
          className="w-10 h-10 rounded-2xl shadow-md border-2 border-white object-cover" 
        />
      )}
      <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{message.senderName}</span>}
        <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`px-5 py-3 rounded-3xl text-[14px] leading-relaxed relative shadow-sm transition-all ${
            message.isImportant 
              ? 'bg-red-50 border-2 border-red-500 text-red-900 ring-4 ring-red-50 font-bold' 
              : isMe ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white border border-slate-200 text-slate-700'
          }`}>
            {message.isImportant && (
              <div className="absolute -top-3 left-3 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg">重要</div>
            )}
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <div className={`flex flex-col text-[9px] text-slate-400 font-bold min-w-[30px] ${isMe ? 'items-end' : 'items-start'}`}>
            {isMe && message.readBy.length > 1 && (
              <span className="text-blue-500 mb-0.5">既読</span>
            )}
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
