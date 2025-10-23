
import React, { useState, useCallback } from 'react';
import { View } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import PackagesView from './views/PackagesView';
import ReportsView from './views/ReportsView';
import AccessView from './views/AccessView';
import DirectoryView from './views/DirectoryView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Home);

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
        return <DirectoryView />;
      default:
        return <HomeView />;
    }
  }, [activeView]);

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
