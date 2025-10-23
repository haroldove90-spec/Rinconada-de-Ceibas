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
  const activeClass = isActive ? 'text-white' : 'text-teal-200 hover:text-white';

  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${activeClass}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'transform scale-125' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-primary shadow-lg">
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