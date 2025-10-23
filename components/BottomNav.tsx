
import React from 'react';
import { View } from '../types';
import { HomeIcon, PackageIcon, WrenchScrewdriverIcon, QrCodeIcon, UsersIcon } from './icons/Icons';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactNode;
  activeView: View;
  onClick: (view: View) => void;
}> = ({ view, label, icon, activeView, onClick }) => {
  const isActive = activeView === view;
  const activeClass = isActive ? 'text-primary' : 'text-gray-500 hover:text-primary';

  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeClass}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto flex justify-around items-center h-16">
        <NavItem view={View.Home} label="Inicio" icon={<HomeIcon />} activeView={activeView} onClick={setActiveView} />
        <NavItem view={View.Packages} label="Paquetes" icon={<PackageIcon />} activeView={activeView} onClick={setActiveView} />
        <NavItem view={View.Reports} label="Reportes" icon={<WrenchScrewdriverIcon />} activeView={activeView} onClick={setActiveView} />
        <NavItem view={View.Access} label="Accesos" icon={<QrCodeIcon />} activeView={activeView} onClick={setActiveView} />
        <NavItem view={View.Directory} label="Directorio" icon={<UsersIcon />} activeView={activeView} onClick={setActiveView} />
      </div>
    </footer>
  );
};

export default BottomNav;
