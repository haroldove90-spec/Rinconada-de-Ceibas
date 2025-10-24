import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { useUser } from '../context/UserContext';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recipient }) => {
  const { currentUser, chatHistory, sendChatMessage, markConversationAsRead } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory, recipient, isOpen]);
  
  useEffect(() => {
    if (!isOpen) {
        setNewMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
      if (isOpen && currentUser) {
          const conversationId = [currentUser.id, recipient.id].sort().join('-');
          markConversationAsRead(conversationId);
      }
  }, [isOpen, currentUser, recipient.id, markConversationAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    
    sendChatMessage(currentUser, recipient, newMessage.trim());
    setNewMessage('');
  };

  if (!isOpen || !currentUser) return null;

  const conversationId = [currentUser.id, recipient.id].sort().join('-');
  const messages = chatHistory[conversationId] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center flex-shrink-0">
          <img src={recipient.avatarUrl} alt={recipient.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{recipient.name}</h2>
            <p className="text-xs text-gray-500">Casa {recipient.houseNumber}</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 sm:relative sm:top-auto sm:right-auto sm:ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto bg-light space-y-4">
          {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 italic my-2">
                  Inicia una conversación con {recipient.name}.
              </div>
          )}
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center text-xs text-gray-500 italic my-2">
                  {msg.text}
                </div>
              );
            }
            const isMe = msg.sender.id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-6 h-6 rounded-full" />
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
            );
          })}
           <div ref={messagesEndRef} />
        </div>
        <div className="p-2 border-t flex-shrink-0 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow w-full p-2.5 border border-gray-300 rounded-full focus:ring-primary focus:border-primary bg-gray-100 text-black"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus disabled:bg-gray-300 transition-colors"
                    disabled={!newMessage.trim()}
                    aria-label="Enviar mensaje"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;