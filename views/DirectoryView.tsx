import React from 'react';
import { User } from '../types';
import { useUser } from '../context/UserContext';

interface DirectoryViewProps {
  onStartChat: (user: User) => void;
}

const NeighborCard: React.FC<{ neighbor: User; onMessageClick: (neighbor: User) => void }> = ({ neighbor, onMessageClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg mb-3 p-4 flex items-center justify-between transition-shadow hover:shadow-2xl">
            <div className="flex items-center">
                <img src={neighbor.avatarUrl} alt={neighbor.name} className="w-12 h-12 rounded-full mr-4"/>
                <div>
                    <p className="font-bold text-gray-800">{neighbor.name} {neighbor.role === 'admin' && <span className="text-xs font-semibold bg-secondary text-white px-2 py-0.5 rounded-full ml-2">Admin</span>}</p>
                    <p className="text-sm text-gray-600">Casa {neighbor.houseNumber}</p>
                </div>
            </div>
            <button 
              onClick={() => onMessageClick(neighbor)}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-focus"
            >
                Mensaje
            </button>
        </div>
    );
};

const DirectoryView: React.FC<DirectoryViewProps> = ({ onStartChat }) => {
    const { users, currentUser } = useUser();
    
    const filteredNeighbors = users.filter(neighbor => 
        neighbor.id !== currentUser?.id
    ).sort((a,b) => a.houseNumber - b.houseNumber);

    return (
        <div>
            <div className="space-y-2">
                 {filteredNeighbors.map(neighbor => <NeighborCard key={neighbor.id} neighbor={neighbor} onMessageClick={onStartChat} />)}
            </div>
        </div>
    );
};

export default DirectoryView;