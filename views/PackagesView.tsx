import React, { useState, useEffect } from 'react';
import { PackageRequest, PackageRequestStatus } from '../types';
import { useUser } from '../context/UserContext';
import Modal from '../components/Modal';
import { supabase } from '../services/supabaseClient';

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

const getStatusChip = (status: PackageRequestStatus) => {
    switch (status) {
        case PackageRequestStatus.Pending:
            return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Accepted:
            return <span className="px-2 py-1 text-xs font-semibold text-teal-800 bg-teal-200 rounded-full">{status}</span>;
        case PackageRequestStatus.Completed:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
        default: 
            return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
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
    const [requests, setRequests] = useState<PackageRequest[]>([]);
    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
    const { currentUser } = useUser();

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('packages')
            .select(`
                *,
                requester:requester_id(id, name, house_number, avatar_url, role),
                helper:helper_id(id, name, house_number, avatar_url, role)
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(error);
            return;
        }

        if (data) {
            const mapped: PackageRequest[] = data.map((r: any) => ({
                id: r.id,
                carrier: r.carrier,
                deliveryTime: r.delivery_time,
                status: r.status as PackageRequestStatus,
                requester: {
                    id: r.requester.id,
                    name: r.requester.name,
                    houseNumber: r.requester.house_number,
                    avatarUrl: r.requester.avatar_url,
                    role: r.requester.role
                },
                helper: r.helper ? {
                    id: r.helper.id,
                    name: r.helper.name,
                    houseNumber: r.helper.house_number,
                    avatarUrl: r.helper.avatar_url,
                    role: r.helper.role
                } : undefined
            }));
            setRequests(mapped);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (!currentUser) {
        return <div>Cargando...</div>;
    }

    const handleOfferHelp = async (requestId: string) => {
        const { error } = await supabase
            .from('packages')
            .update({ 
                status: PackageRequestStatus.Accepted,
                helper_id: currentUser.id
            })
            .eq('id', requestId);
            
        if (!error) fetchRequests();
    };

    const handleCompleteRequest = async (requestId: string) => {
        const { error } = await supabase
            .from('packages')
            .update({ status: PackageRequestStatus.Completed })
            .eq('id', requestId);

        if (!error) fetchRequests();
    };
    
    const handleAddRequest = async (carrier: string, deliveryTime: string) => {
        const { error } = await supabase
            .from('packages')
            .insert([{
                requester_id: currentUser.id,
                carrier,
                delivery_time: deliveryTime,
                status: PackageRequestStatus.Pending
            }]);

        if (!error) {
            fetchRequests();
            setIsNewRequestModalOpen(false);
        }
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