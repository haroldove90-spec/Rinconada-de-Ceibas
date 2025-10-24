import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { useUser } from '../context/UserContext';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recipient }) => {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'system1',
          sender: 'system',
          text: `Iniciaste una conversación con ${recipient.name}.`,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
        setMessages([]);
    }
  }, [isOpen, recipient]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  if (!isOpen) return null;

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto bg-light space-y-4">
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
      </div>
    </div>
  );
};

export default ChatModal;