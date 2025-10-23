import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary-light shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Rinconada de Ceibas
        </h1>
      </div>
    </header>
  );
};

export default Header;