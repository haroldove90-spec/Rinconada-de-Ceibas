
import React, { useState } from 'react';
import { PackageRequest, PackageRequestStatus, User } from '../types';
import Modal from '../components/Modal';

const mockUsers: { [key: string]: User } = {
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
    'user4': { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://i.pravatar.cc/150?u=luisa' },
};

const initialRequests: PackageRequest[] = [
    { id: 'pkg1', requester: mockUsers['user2'], carrier: 'Amazon', deliveryTime: 'Hoy, 3-5 PM', status: PackageRequestStatus.Pending },
    { id: 'pkg2', requester: mockUsers['user4'], carrier: 'Mercado Libre', deliveryTime: 'Mañana, 10 AM', status: PackageRequestStatus.Accepted, helper: mockUsers['user3'] },
    { id: 'pkg3', requester: mockUsers['user3'], carrier: 'Estafeta', deliveryTime: 'Ayer', status: PackageRequestStatus.Completed, helper: mockUsers['user2'] },
    { id: 'pkg4', requester: mockUsers['user3'], carrier: 'DHL', deliveryTime: 'Hoy, 12-2 PM', status: PackageRequestStatus.Accepted, helper: mockUsers['user4'] },
];

const currentUser = mockUsers['user3'];

const NewPackageRequestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddRequest: (data: { carrier: string; deliveryTime: string; }) => void;
}> = ({ isOpen, onClose, onAddRequest }) => {
    const [carrier, setCarrier] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    const formatDateTime = (dateStr: string, timeStr: string): string => {
        if (!dateStr) return 'Fecha no especificada';
        const date = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
        
        const datePart = new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'medium',
        }).format(date);

        if (!timeStr) {
            return datePart;
        }

        const time12h = new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);

        const time24h = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);

        return `${datePart}, ${time12h} (${time24h} hrs)`;
    };

    const cleanup = () => {
        setCarrier('');
        setDeliveryDate('');
        setDeliveryTime('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (carrier.trim() && deliveryDate.trim()) {
            onAddRequest({ carrier, deliveryTime: formatDateTime(deliveryDate, deliveryTime) });
            cleanup();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={cleanup} title="Solicitar Ayuda para Paquete">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="package-carrier-field" className="block text-sm font-medium text-gray-700">Transportista</label>
                    <input type="text" id="package-carrier-field" name="package-carrier-field" value={carrier} onChange={e => setCarrier(e.target.value)} required placeholder="Ej: Amazon, Mercado Libre" className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" autoComplete="new-password" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Fecha de entrega</label>
                        <input type="date" id="deliveryDate" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">Hora estimada (Opcional)</label>
                        <input type="time" id="deliveryTime" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={cleanup} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Publicar Solicitud</button>
                </div>
            </form>
        </Modal>
    );
};

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

const PackageRequestCard: React.FC<{
    request: PackageRequest;
    onOfferHelp: (id: string) => void;
    onCompleteRequest: (id: string) => void;
}> = ({ request, onOfferHelp, onCompleteRequest }) => {
    const isMyRequest = request.requester.id === currentUser.id;
    const iAmHelping = request.helper?.id === currentUser.id;

    return (
        <div className="bg-white rounded-lg shadow-md mb-4 p-4 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">Paquete de {request.requester.name} (Casa {request.requester.houseNumber})</p>
                    <p className="text-sm text-gray-600">Transportista: <span className="font-semibold">{request.carrier}</span></p>
                    <p className="text-sm text-gray-600">Entrega: <span className="font-semibold">{request.deliveryTime}</span></p>
                     {request.helper && <p className={`text-sm font-semibold ${iAmHelping ? 'text-secondary' : 'text-primary'}`}>{iAmHelping ? 'Estás ayudando' : `Ayudando: ${request.helper.name}`}</p>}
                </div>
                {getStatusChip(request.status)}
            </div>
             <div className="mt-4 pt-3 border-t border-gray-100 text-right">
                {!isMyRequest && request.status === PackageRequestStatus.Pending && (
                    <button onClick={() => onOfferHelp(request.id)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors">Ofrecer Ayuda</button>
                )}
                {isMyRequest && request.status === PackageRequestStatus.Accepted && (
                     <button onClick={() => onCompleteRequest(request.id)} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-amber-600 transition-colors">Marcar como Recibido</button>
                )}
             </div>
        </div>
    );
};

const PackagesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'help'>('requests');
    const [requests, setRequests] = useState<PackageRequest[]>(initialRequests);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOfferHelp = (requestId: string) => {
        setRequests(requests.map(req => 
            req.id === requestId 
            ? { ...req, status: PackageRequestStatus.Accepted, helper: currentUser }
            : req
        ));
    };

    const handleCompleteRequest = (requestId: string) => {
        setRequests(requests.map(req => 
            req.id === requestId
            ? { ...req, status: PackageRequestStatus.Completed }
            : req
        ));
    };
    
    const handleAddRequest = (data: { carrier: string, deliveryTime: string }) => {
        const newRequest: PackageRequest = {
            id: `pkg${Date.now()}`,
            requester: currentUser,
            carrier: data.carrier,
            deliveryTime: data.deliveryTime,
            status: PackageRequestStatus.Pending,
        };
        setRequests([newRequest, ...requests]);
    };

    const myRequests = requests.filter(r => r.requester.id === currentUser.id);
    const helpRequests = requests.filter(r => r.requester.id !== currentUser.id && r.status !== PackageRequestStatus.Completed);

    return (
        <div>
            <div className="flex justify-center mb-4 bg-gray-200 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`w-full py-2 rounded-md transition-colors ${activeTab === 'requests' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}
                    aria-pressed={activeTab === 'requests'}
                >
                    Necesito Ayuda
                </button>
                <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full py-2 rounded-md transition-colors ${activeTab === 'help' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}
                    aria-pressed={activeTab === 'help'}
                >
                    Ayudar a un Vecino
                </button>
            </div>
            
            {activeTab === 'requests' && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-gray-700">Mis Solicitudes</h2>
                        <span className="font-bold text-primary">{myRequests.length}</span>
                    </div>
                    {myRequests.length > 0 ? (
                        myRequests.map(req => (
                            <PackageRequestCard key={req.id} request={req} onOfferHelp={handleOfferHelp} onCompleteRequest={handleCompleteRequest} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-8">No tienes solicitudes activas.</p>
                    )}
                     <button onClick={() => setIsModalOpen(true)} className="w-full mt-2 bg-accent text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105">
                        + Crear Solicitud de Ayuda
                    </button>
                </div>
            )}
            
            {activeTab === 'help' && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                         <h2 className="text-xl font-bold text-gray-700">Solicitudes de Vecinos</h2>
                         <span className="font-bold text-primary">{helpRequests.filter(r => r.status === PackageRequestStatus.Pending).length} pendientes</span>
                    </div>

                    {helpRequests.length > 0 ? (
                        helpRequests.map(req => (
                            <PackageRequestCard key={req.id} request={req} onOfferHelp={handleOfferHelp} onCompleteRequest={handleCompleteRequest} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-8">No hay vecinos que necesiten ayuda en este momento.</p>
                    )}
                </div>
            )}
            <NewPackageRequestModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddRequest={handleAddRequest}
            />
        </div>
    );
};

export default PackagesView;
