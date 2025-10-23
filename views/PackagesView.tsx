
import React, { useState } from 'react';
import { PackageRequest, PackageRequestStatus, User } from '../types';

const mockUsers: { [key: string]: User } = {
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://picsum.photos/seed/carlos/100/100' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://picsum.photos/seed/ana/100/100' },
    'user4': { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://picsum.photos/seed/luisa/100/100' },
};

const initialRequests: PackageRequest[] = [
    { id: 'pkg1', requester: mockUsers['user2'], carrier: 'Amazon', deliveryTime: 'Hoy, 3-5 PM', status: PackageRequestStatus.Pending },
    { id: 'pkg2', requester: mockUsers['user4'], carrier: 'Mercado Libre', deliveryTime: 'Mañana, 10 AM', status: PackageRequestStatus.Accepted, helper: mockUsers['user3'] },
    { id: 'pkg3', requester: mockUsers['user3'], carrier: 'Estafeta', deliveryTime: 'Ayer', status: PackageRequestStatus.Completed, helper: mockUsers['user2'] },
];

const getStatusChip = (status: PackageRequestStatus) => {
    switch (status) {
        case PackageRequestStatus.Pending:
            return <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Accepted:
            return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Completed:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
    }
};

const PackageRequestCard: React.FC<{ request: PackageRequest, canHelp: boolean }> = ({ request, canHelp }) => {
    return (
        <div className="bg-white rounded-lg shadow-md mb-4 p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">Paquete de {request.requester.name} (Casa {request.requester.houseNumber})</p>
                    <p className="text-sm text-gray-600">Transportista: {request.carrier}</p>
                    <p className="text-sm text-gray-600">Entrega: {request.deliveryTime}</p>
                     {request.helper && <p className="text-sm text-primary font-semibold">Ayudando: {request.helper.name}</p>}
                </div>
                {getStatusChip(request.status)}
            </div>
             {canHelp && request.status === PackageRequestStatus.Pending && (
                <div className="mt-4 text-right">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">Ofrecer Ayuda</button>
                </div>
            )}
        </div>
    );
};


const PackagesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'help'>('requests');

    return (
        <div>
            <div className="flex justify-center mb-4 bg-gray-200 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`w-full py-2 rounded-md transition-colors ${activeTab === 'requests' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}
                >
                    Necesito Ayuda
                </button>
                <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full py-2 rounded-md transition-colors ${activeTab === 'help' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}
                >
                    Ayudar a un Vecino
                </button>
            </div>
            
            {activeTab === 'requests' && (
                <div>
                    <h2 className="text-xl font-bold mb-3 text-gray-700">Mis Solicitudes de Paquetes</h2>
                    {initialRequests.filter(r => r.requester.id === 'user3').map(req => (
                        <PackageRequestCard key={req.id} request={req} canHelp={false} />
                    ))}
                     <button className="w-full mt-2 bg-accent text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105">
                        Crear Solicitud de Ayuda
                    </button>
                </div>
            )}
            
            {activeTab === 'help' && (
                <div>
                    <h2 className="text-xl font-bold mb-3 text-gray-700">Solicitudes de Vecinos</h2>
                    {initialRequests.filter(r => r.status !== PackageRequestStatus.Completed).map(req => (
                        <PackageRequestCard key={req.id} request={req} canHelp={true} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PackagesView;
