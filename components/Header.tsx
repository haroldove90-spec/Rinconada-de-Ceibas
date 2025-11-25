import React from 'react';
import { useUser } from '../context/UserContext';

interface HeaderProps {
    onOpenRegistration: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenRegistration }) => {
  const { currentUser, logout, isLoading } = useUser();

  return (
    <header className="bg-gradient-to-r from-primary to-primary-light shadow-lg sticky top-0 z-10">
      <div className="container py-3 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate flex items-center gap-2">
          <span className="sm:hidden">Rinconada</span>
          <span className="hidden sm:inline">Rinconada de Ceibas</span>
        </h1>
        <div className="flex items-center space-x-3">
            {isLoading ? (
                <span className="text-white text-sm">Cargando...</span>
            ) : currentUser ? (
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end text-white">
                        <span className="text-sm font-bold">{currentUser.name}</span>
                        <span className="text-xs opacity-90">Casa {currentUser.houseNumber}</span>
                    </div>
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/50" />
                    <button 
                        onClick={logout} 
                        className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition"
                    >
                        Salir
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onOpenRegistration} 
                    className="px-4 py-1.5 text-sm font-semibold bg-white text-primary rounded-md hover:bg-slate-100 transition-colors shadow-sm"
                >
                    Iniciar Sesión / Registro
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;