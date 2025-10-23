import React, { useState } from 'react';
import { User } from '../types';

const initialNeighbors: User[] = [
    { id: 'user1', name: 'Admin', houseNumber: 0, avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
    { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://picsum.photos/seed/carlos/100/100' },
    { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://picsum.photos/seed/ana/100/100' },
    { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://picsum.photos/seed/luisa/100/100' },
    { id: 'user5', name: 'Miguel Hernández', houseNumber: 3, avatarUrl: 'https://picsum.photos/seed/miguel/100/100' },
    { id: 'user6', name: 'Sofía Ramírez', houseNumber: 15, avatarUrl: 'https://picsum.photos/seed/sofia/100/100' },
];

const NeighborCard: React.FC<{ neighbor: User }> = ({ neighbor }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg mb-3 p-4 flex items-center justify-between transition-shadow hover:shadow-2xl">
            <div className="flex items-center">
                <img src={neighbor.avatarUrl} alt={neighbor.name} className="w-12 h-12 rounded-full mr-4"/>
                <div>
                    <p className="font-bold text-gray-800">{neighbor.name}</p>
                    <p className="text-sm text-gray-600">Casa {neighbor.houseNumber}</p>
                </div>
            </div>
            <button className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-focus">
                Mensaje
            </button>
        </div>
    );
};

const DirectoryView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredNeighbors = initialNeighbors.filter(neighbor => 
        neighbor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        neighbor.houseNumber.toString().includes(searchTerm)
    ).sort((a,b) => a.houseNumber - b.houseNumber);

    return (
        <div>
            <div className="mb-4 sticky top-[60px] z-5">
                <input 
                    type="text"
                    placeholder="Buscar por nombre o casa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-gray-100 text-gray-900"
                />
            </div>
            <div className="space-y-2">
                 {filteredNeighbors.map(neighbor => <NeighborCard key={neighbor.id} neighbor={neighbor} />)}
            </div>
        </div>
    );
};

export default DirectoryView;