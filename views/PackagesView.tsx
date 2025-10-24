import React, { useState } from 'react';
import { PackageRequest, PackageRequestStatus } from '../types';
import { useUser } from '../context/UserContext';
import Modal from '../components/Modal';

const NewPackageRequestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddRequest: (carrier: string, deliveryTime: string) => void;
}> = ({ isOpen, onClose, onAddRequest }) => {
    const [carrier, setCarrier] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (carrier.trim() && deliveryTime.trim()) {
            onAddRequest(carrier, deliveryTime);
            setCarrier('');
            setDeliveryTime('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Ayuda con Paquete">
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">Paquetería</label>
                    <input
                        id="carrier"
                        type="text"
                        value={carrier}
                        onChange={e => setCarrier(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: Amazon, Mercado Libre"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">Horario de Entrega Estimado</label>
                    <input
                        id="deliveryTime"
                        type="text"
                        value={deliveryTime}
                        onChange={e => setDeliveryTime(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: Hoy, 3-5 PM"
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Solicitar</button>
                </div>
            </form>
        </Modal>
    );
};

const initialRequests: PackageRequest[] = [
    { id: 'pkg1', requester: { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'user' }, carrier: 'Amazon', deliveryTime: 'Hoy, 3-5 PM', status: PackageRequestStatus.Pending },
    { id: 'pkg2', requester: { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://i.pravatar.cc/150?u=luisa', role: 'user' }, carrier: 'Mercado Libre', deliveryTime: 'Mañana, 10 AM', status: PackageRequestStatus.Accepted, helper: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' } },
    { id: 'pkg3', requester: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' }, carrier: 'Estafeta', deliveryTime: 'Ayer', status: PackageRequestStatus.Completed, helper: { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'user' } },
    { id: 'pkg4', requester: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' }, carrier: 'DHL', deliveryTime: 'Hoy, 12-2 PM', status: PackageRequestStatus.Accepted, helper: { id: 'user4', name: 'Luisa Torres', houseNumber: 8, avatarUrl: 'https://i.pravatar.cc/150?u=luisa', role: 'user' } },
];

const getStatusChip = (status: PackageRequestStatus) => {
    switch (status) {
        case PackageRequestStatus.Pending:
            return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Accepted:
            return <span className="px-2 py-1 text-xs font-semibold text-teal-800 bg-teal-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Completed:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
    }
};

const PackageRequestCard: React.FC<{
    request: PackageRequest;
    onOfferHelp: (id: string) => void;
    onCompleteRequest: (id: string) => void;
}> = ({ request, onOfferHelp, onCompleteRequest }) => {
    const { currentUser } = useUser();
    if (!currentUser) return null;

    const isMyRequest = request.requester.id === currentUser.id;
    const iAmHelping = request.helper?.id === currentUser.id;

    return (
        <div className="bg-white rounded-xl shadow-lg mb-4 p-4 transition-shadow duration-300 hover:shadow-xl">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">Paquete de {request.requester.name} (Casa {request.requester.houseNumber})</p>
                    <p className="text-sm text-gray-600">Transportista: <span className="font-semibold">{request.carrier}</span></p>
                    <p className="text-sm text-gray-600">Entrega: <span className="font-semibold">{request.deliveryTime}</span></p>
                     {request.helper && <p className={`text-sm font-semibold ${iAmHelping ? 'text-secondary' : 'text-primary'}`}>{iAmHelping ? 'Estás ayudando' : `Ayudando: ${request.helper.name}`}</p>}
                </div>
                {getStatusChip(request.status)}
            </div>
             <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                {!isMyRequest && request.status === PackageRequestStatus.Pending && (
                    <button onClick={() => onOfferHelp(request.id)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors">Ofrecer Ayuda</button>
                )}
                {isMyRequest && request.status === PackageRequestStatus.Accepted && (
                     <button onClick={() => onCompleteRequest(request.id)} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-orange-700 transition-colors">Marcar como Recibido</button>
                )}
             </div>
        </div>
    );
};

const PackagesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'help'>('requests');
    const [requests, setRequests] = useState<PackageRequest[]>(initialRequests);
    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
    const { currentUser } = useUser();

    if (!currentUser) {
        return <div>Cargando...</div>;
    }

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
    
    const handleAddRequest = (carrier: string, deliveryTime: string) => {
        const newRequest: PackageRequest = {
            id: `pkg${Date.now()}`,
            requester: currentUser,
            carrier,
            deliveryTime,
            status: PackageRequestStatus.Pending,
        };
        setRequests(prev => [newRequest, ...prev]);
        setIsNewRequestModalOpen(false);
    };

    const myRequests = requests.filter(r => r.requester.id === currentUser.id);
    const helpRequests = requests.filter(r => r.requester.id !== currentUser.id && r.status !== PackageRequestStatus.Completed);

    return (
        <div>
            <NewPackageRequestModal
                isOpen={isNewRequestModalOpen}
                onClose={() => setIsNewRequestModalOpen(false)}
                onAddRequest={handleAddRequest}
            />
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
                        <button onClick={() => setIsNewRequestModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors text-sm font-semibold">
                            Solicitar Ayuda
                        </button>
                    </div>
                    {myRequests.length > 0 ? (
                        myRequests.map(req => (
                            <PackageRequestCard key={req.id} request={req} onOfferHelp={handleOfferHelp} onCompleteRequest={handleCompleteRequest} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-8">No tienes solicitudes activas.</p>
                    )}
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
        </div>
    );
};

export default PackagesView;