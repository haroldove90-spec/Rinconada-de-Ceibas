import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { User, ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserContextType {
    users: User[];
    currentUser: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<{ error: any }>;
    register: (email: string, pass: string, name: string, houseNumber: number) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    chatHistory: Record<string, ChatMessage[]>;
    sendChatMessage: (from: User, to: User, text: string) => Promise<void>;
    markConversationAsRead: (conversationId: string) => Promise<void>;
    unreadInfo: { total: number };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

    // 1. Fetch Directory (All visible profiles)
    const fetchDirectory = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('house_number', { ascending: true });
            
            if (error) {
                console.error('Error loading users:', error);
            } else if (data) {
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    houseNumber: u.house_number,
                    avatarUrl: u.avatar_url || `https://i.pravatar.cc/150?u=${u.id}`,
                    role: u.role
                }));
                setUsers(mappedUsers);
            }
        } catch (e) {
            console.error("Exception fetching directory:", e);
        }
    }, []);

    const fetchCurrentUserProfile = async (userId: string, email?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // Use maybeSingle instead of single to handle null gracefully
            
            if (data) {
                setCurrentUser({
                    id: data.id,
                    name: data.name,
                    houseNumber: data.house_number,
                    avatarUrl: data.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`,
                    role: data.role
                });
            } else {
                // Self-healing: Profile missing but Auth exists (e.g., after DB reset)
                console.warn("Profile missing for auth user. Attempting to recreate.");
                if (email) {
                   const { error: insertError } = await supabase.from('profiles').insert([{
                        id: userId,
                        name: 'Vecino (Restaurado)',
                        house_number: 0,
                        role: 'user',
                        avatar_url: `https://i.pravatar.cc/150?u=${userId}`
                   }]);
                   
                   if (!insertError) {
                       // Retry fetch
                       const { data: newData } = await supabase.from('profiles').select('*').eq('id', userId).single();
                       if (newData) {
                            setCurrentUser({
                                id: newData.id,
                                name: newData.name,
                                houseNumber: newData.house_number,
                                avatarUrl: newData.avatar_url,
                                role: newData.role
                            });
                       }
                   }
                } else {
                    setCurrentUser(null);
                }
            }
        } catch (e) {
            console.error("Exception fetching profile:", e);
        }
    };

    // 2. Handle Auth State Changes
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Initial fetch of directory
                await fetchDirectory();

                // Check active session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) throw error;

                if (mounted) {
                    if (session?.user) {
                        await fetchCurrentUserProfile(session.user.id, session.user.email);
                    } else {
                        setCurrentUser(null);
                    }
                }
            } catch (err) {
                console.error("Auth initialization failed:", err);
                if (mounted) setCurrentUser(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                await fetchCurrentUserProfile(session.user.id, session.user.email);
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchDirectory]);


    // 3. Auth Actions
    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
        return { error };
    };

    const register = async (email: string, pass: string, name: string, houseNumber: number) => {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: pass,
        });

        if (authError) return { error: authError };
        if (!authData.user) return { error: { message: "No se pudo crear el usuario" } };

        // 2. Create Profile linked to Auth ID
        // Use upsert to safely handle cases where profile creation is retried
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: authData.user.id,
                name: name,
                house_number: houseNumber,
                role: 'user', // Default role
                avatar_url: `https://i.pravatar.cc/150?u=${authData.user.id}`
            }], { onConflict: 'id' });

        if (profileError) {
            console.error("Profile creation failed:", profileError);
            return { error: profileError };
        }

        // 3. Ensure local state is updated immediately
        await fetchCurrentUserProfile(authData.user.id, email);
        
        // Refresh directory to include new user
        fetchDirectory();
        
        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    // 4. Chat System
    // Fetch Messages
    const fetchMessages = useCallback(async () => {
        if (!currentUser) return;
        
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(id, name, house_number, avatar_url, role),
                recipient:recipient_id(id, name, house_number, avatar_url, role)
            `)
            .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        if (data) {
            const history: Record<string, ChatMessage[]> = {};
            
            data.forEach((msg: any) => {
                const otherId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
                const conversationId = [currentUser.id, otherId].sort().join('-');
                
                if (!history[conversationId]) history[conversationId] = [];
                
                if (!msg.sender) return;

                const senderObj: User = {
                    id: msg.sender.id,
                    name: msg.sender.name,
                    houseNumber: msg.sender.house_number,
                    avatarUrl: msg.sender.avatar_url,
                    role: msg.sender.role
                };

                const timestamp = new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

                history[conversationId].push({
                    id: msg.id,
                    sender: senderObj,
                    text: msg.text,
                    timestamp: timestamp,
                    readBy: msg.is_read ? [msg.sender_id, msg.recipient_id] : [msg.sender_id]
                });
            });
            setChatHistory(history);
        }
    }, [currentUser]);

    // Set up realtime subscription for messages
    useEffect(() => {
        if (!currentUser) return;
        fetchMessages();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, fetchMessages]);


    const sendChatMessage = async (from: User, to: User, text: string) => {
        const { error } = await supabase
            .from('messages')
            .insert([{
                sender_id: from.id,
                recipient_id: to.id,
                text: text,
                is_read: false
            }]);
        
        if (error) {
            console.error('Error sending message:', error);
        }
    };
    
    const markConversationAsRead = async (conversationId: string) => {
        if (!currentUser) return;
        
        const ids = conversationId.split('-');
        const otherId = ids.find(id => id !== currentUser.id);
        
        if (!otherId) return;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', otherId)
            .eq('recipient_id', currentUser.id)
            .eq('is_read', false);

        if (error) console.error('Error marking read:', error);
    };

    const unreadInfo = useMemo(() => {
        if (!currentUser) return { total: 0 };
        let totalUnread = 0;
        Object.values(chatHistory).forEach(conversation => {
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

    const value = { 
        users, 
        currentUser, 
        isLoading,
        login, 
        register, 
        logout,
        chatHistory, 
        sendChatMessage, 
        markConversationAsRead, 
        unreadInfo 
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};