import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/Icons';

interface FloatingChatButtonProps {
    onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 bg-secondary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
            aria-label="Abrir chat con administración"
        >
            <ChatBubbleOvalLeftEllipsisIcon />
        </button>
    );
};

export default FloatingChatButton;
