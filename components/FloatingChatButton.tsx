import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/Icons';
import { useUser } from '../context/UserContext';

interface FloatingChatButtonProps {
    onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
    const { unreadInfo } = useUser();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 bg-secondary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
            aria-label="Abrir lista de chats"
        >
            <ChatBubbleOvalLeftEllipsisIcon />
            {unreadInfo.total > 0 && (
                 <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                    {unreadInfo.total}
                </span>
            )}
        </button>
    );
};

export default FloatingChatButton;