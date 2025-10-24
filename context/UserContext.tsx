import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { User, ChatMessage } from '../types';

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
    chatHistory: Record<string, ChatMessage[]>;
    sendChatMessage: (from: User, to: User, text: string) => void;
    markConversationAsRead: (conversationId: string) => void;
    unreadInfo: { total: number };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const savedUsers = window.localStorage.getItem('rinconada-users');
            return savedUsers ? JSON.parse(savedUsers) : initialUsers;
        } catch (error) {
            console.warn('Could not load users from localStorage', error);
            return initialUsers;
        }
    });
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const allUsers: User[] = JSON.parse(window.localStorage.getItem('rinconada-users') || JSON.stringify(initialUsers));
            const currentUserId = window.localStorage.getItem('rinconada-currentUser-id');
            if (currentUserId) {
                const foundUser = allUsers.find((u: User) => u.id === currentUserId);
                if (foundUser) return foundUser;
            }
            return allUsers[0] || null;
        } catch (error) {
            console.warn('Could not load current user from localStorage', error);
            return initialUsers[0] || null;
        }
    });

    const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
        try {
            const savedHistory = window.localStorage.getItem('rinconada-chatHistory');
            const parsedHistory = savedHistory ? JSON.parse(savedHistory) : {};
            // Migration for old messages without 'readBy'
            Object.keys(parsedHistory).forEach(key => {
                parsedHistory[key] = parsedHistory[key].map((msg: any) => ({
                    ...msg,
                    readBy: msg.readBy || (msg.sender ? [msg.sender.id] : []),
                }));
            });
            return parsedHistory;
        } catch (error) {
            console.warn('Could not load chat history from localStorage', error);
            return {};
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('rinconada-users', JSON.stringify(users));
        } catch (error) {
            console.warn('Could not save users to localStorage', error);
        }
    }, [users]);
    
    useEffect(() => {
        try {
            if (currentUser) {
                window.localStorage.setItem('rinconada-currentUser-id', currentUser.id);
            } else {
                window.localStorage.removeItem('rinconada-currentUser-id');
            }
        } catch (error) {
            console.warn('Could not save current user to localStorage', error);
        }
    }, [currentUser]);

    useEffect(() => {
        try {
            window.localStorage.setItem('rinconada-chatHistory', JSON.stringify(chatHistory));
        } catch (error) {
            console.warn('Could not save chat history to localStorage', error);
        }
    }, [chatHistory]);


    const addUser = (userData: { name: string; houseNumber: number }) => {
        const newUser: User = {
            id: `user${Date.now()}`,
            name: userData.name,
            houseNumber: userData.houseNumber,
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            role: 'user',
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setCurrentUser(newUser);
    };

    const sendChatMessage = (from: User, to: User, text: string) => {
        const conversationId = [from.id, to.id].sort().join('-');
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: from,
            text,
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            readBy: [from.id], // The sender has "read" it by sending it
        };
        
        setChatHistory(prev => {
            const newHistory = { ...prev };
            const conversation = newHistory[conversationId] ? [...newHistory[conversationId]] : [];
            conversation.push(newMessage);
            newHistory[conversationId] = conversation;
            return newHistory;
        });
    };
    
    const markConversationAsRead = (conversationId: string) => {
        if (!currentUser) return;
        const userId = currentUser.id;

        setChatHistory(prev => {
            const newHistory = { ...prev };
            const conversation = newHistory[conversationId] || [];
            let changed = false;
            const updatedConversation = conversation.map(msg => {
                if (!msg.readBy.includes(userId)) {
                    changed = true;
                    return { ...msg, readBy: [...msg.readBy, userId] };
                }
                return msg;
            });

            if(changed) {
                newHistory[conversationId] = updatedConversation;
                return newHistory;
            }
            return prev;
        });
    };

    const unreadInfo = useMemo(() => {
        if (!currentUser) return { total: 0 };
        let totalUnread = 0;
        Object.values(chatHistory).forEach(conversation => {
            // FIX: Add type guard to ensure 'conversation' is an array before iterating over it.
            if (Array.isArray(conversation)) {
                conversation.forEach(msg => {
                    if (
                        msg.sender !== 'system' &&
                        msg.sender.id !== currentUser.id &&
                        !msg.readBy.includes(currentUser.id)
                    ) {
                        totalUnread++;
                    }
                });
            }
        });
        return { total: totalUnread };
    }, [chatHistory, currentUser]);


    const value = { users, currentUser, setCurrentUser, addUser, chatHistory, sendChatMessage, markConversationAsRead, unreadInfo };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};