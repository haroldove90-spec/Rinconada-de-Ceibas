import React from 'react';
import { useUser } from '../context/UserContext';

const Header: React.FC = () => {
  const { users, currentUser, setCurrentUser } = useUser();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find(u => u.id === e.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary to-primary-light shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Rinconada de Ceibas
        </h1>
        <div className="flex items-center space-x-2">
            <select 
              value={currentUser?.id} 
              onChange={handleUserChange}
              className="bg-white/20 text-white text-sm font-semibold border-none rounded-md p-1.5 focus:ring-2 focus:ring-white/50"
              aria-label="Seleccionar usuario"
            >
              {users.map(user => (
                <option key={user.id} value={user.id} className="text-black">
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
        </div>
      </div>
    </header>
  );
};

export default Header;