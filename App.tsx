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
import { useUser } from './context/UserContext';


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Home);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<User | null>(null);
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const { users } = useUser();
  const adminUser = users.find(u => u.role === 'admin');

  const handleOpenChat = useCallback((recipient: User) => {
    setChatRecipient(recipient);
    setIsChatOpen(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    setChatRecipient(null);
  }, []);
  
  const handleOpenAdminChat = useCallback(() => {
    if (adminUser) {
        handleOpenChat(adminUser);
    }
  }, [adminUser, handleOpenChat]);

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
      <Header onRegisterClick={() => setRegistrationOpen(true)} />
      <main className="flex-grow container mx-auto p-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      <FloatingChatButton onClick={handleOpenAdminChat} />
      {chatRecipient && (
          <ChatModal 
            isOpen={isChatOpen}
            onClose={handleCloseChat}
            recipient={chatRecipient}
          />
      )}
      <RegistrationModal 
        isOpen={isRegistrationOpen}
        onClose={() => setRegistrationOpen(false)}
      />
    </div>
  );
};

export default App;