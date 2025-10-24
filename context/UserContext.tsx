import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';

const initialUsers: User[] = [
    { id: 'user1', name: 'Admin', houseNumber: 0, avatarUrl: 'https://i.pravatar.cc/150?u=admin', role: 'admin' },
    { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'user' },
    { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' },
    { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://i.pravatar.cc/150?u=luisa', role: 'user' },
    { id: 'user5', name: 'Miguel Hernández', houseNumber: 3, avatarUrl: 'https://i.pravatar.cc/150?u=miguel', role: 'user' },
    { id: 'user6', name: 'Sofía Ramírez', houseNumber: 15, avatarUrl: 'https://i.pravatar.cc/150?u=sofia', role: 'user' },
];

interface UserContextType {
    users: User[];
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
    addUser: (userData: { name: string; houseNumber: number }) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);

    const addUser = (userData: { name: string; houseNumber: number }) => {
        const newUser: User = {
            id: `user${Date.now()}`,
            name: userData.name,
            houseNumber: userData.houseNumber,
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            role: 'user',
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setCurrentUser(newUser); // Automatically log in as the new user
    };

    const value = { users, currentUser, setCurrentUser, addUser };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
