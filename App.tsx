import React, { useState, useCallback } from 'react';
import { View, User } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import PackagesView from './views/PackagesView';
import ReportsView from './views/ReportsView';
import AccessView from './views/AccessView';
import DirectoryView from './views/DirectoryView';
import FloatingChatButton from './components/FloatingChatButton';
import ChatModal from './components/ChatModal';
import RegistrationModal from './components/RegistrationModal';
import Modal from './components/Modal';
import { useUser } from './context/UserContext';

const ChatListViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (user: User) => void;
}> = ({ isOpen, onClose, onSelectChat }) => {
    const { currentUser, users, chatHistory } = useUser();

    if (!currentUser) return null;

    const conversations = Object.entries(chatHistory)
        .map(([conversationId, messages]) => {
            // FIX: Add type guard to ensure 'messages' is an array before using array properties.
            if (!Array.isArray(messages)) {
                return null;
            }
            const userIds = conversationId.split('-');
            if (!userIds.includes(currentUser.id) || messages.length === 0) {
                return null;
            }
            const otherUserId = userIds.find(id => id !== currentUser.id);
            const otherUser = users.find(u => u.id === otherUserId);
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter(msg =>
                msg.sender !== 'system' &&
                msg.sender.id !== currentUser.id &&
                !msg.readBy.includes(currentUser.id)
            ).length;

            if (!otherUser || !lastMessage) return null;

            return { id: conversationId, otherUser, lastMessage, unreadCount, timestamp: lastMessage.timestamp }; // Using string timestamp for sort key
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => {
            if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
            if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
            // A proper date sort would be better, but this is a fallback
            return b.timestamp.localeCompare(a.timestamp);
        });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mis Chats">
            <div className="space-y-2">
                {conversations.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No tienes conversaciones activas. Inicia una desde el Directorio.</p>
                ) : (
                    conversations.map(convo => (
                        <div
                            key={convo.id}
                            onClick={() => onSelectChat(convo.otherUser)}
                            className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <div className="relative">
                                <img src={convo.otherUser.avatarUrl} alt={convo.otherUser.name} className="w-12 h-12 rounded-full mr-4" />
                                {convo.unreadCount > 0 && (
                                     <span className="absolute top-0 left-8 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                                        {convo.unreadCount}
                                     </span>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className={`font-semibold text-gray-800 ${convo.unreadCount > 0 ? 'font-bold' : ''}`}>{convo.otherUser.name}</p>
                                <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                                    {convo.lastMessage.sender === 'system' ? convo.lastMessage.text :
                                     convo.lastMessage.sender.id === currentUser.id ? `Tú: ${convo.lastMessage.text}` : convo.lastMessage.text}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{convo.lastMessage.timestamp}</span>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Home);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<User | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  const handleOpenChat = useCallback((recipient: User) => {
    setChatRecipient(recipient);
    setIsChatOpen(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    setChatRecipient(null);
  }, []);
  
  const handleSelectChat = useCallback((recipient: User) => {
    setIsChatListOpen(false);
    handleOpenChat(recipient);
  }, [handleOpenChat]);

  const renderView = useCallback(() => {
    switch (activeView) {
      case View.Home:
        return <HomeView />;
      case View.Packages:
        return <PackagesView />;
      case View.Reports:
        return <ReportsView />;
      case View.Access:
        return <AccessView />;
      case View.Directory:
        return <DirectoryView onStartChat={handleOpenChat} />;
      default:
        return <HomeView />;
    }
  }, [activeView, handleOpenChat]);

  return (
    <div className="bg-light min-h-screen font-sans flex flex-col">
      <Header onOpenRegistration={() => setIsRegistrationOpen(true)} />
      <main className="flex-grow container mx-auto p-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      <FloatingChatButton onClick={() => setIsChatListOpen(true)} />
       <ChatListViewModal
          isOpen={isChatListOpen}
          onClose={() => setIsChatListOpen(false)}
          onSelectChat={handleSelectChat}
        />
      {chatRecipient && (
          <ChatModal 
            isOpen={isChatOpen}
            onClose={handleCloseChat}
            recipient={chatRecipient}
          />
      )}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
};

export default App;