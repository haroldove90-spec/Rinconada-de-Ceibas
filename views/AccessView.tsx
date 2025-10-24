import React, { useState } from 'react';
import { Visitor } from '../types';
import { ShareIcon } from '../components/icons/Icons';
import Modal from '../components/Modal';

const NewVisitorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddVisitor: (name: string, visitDate: string) => void;
}> = ({ isOpen, onClose, onAddVisitor }) => {
    const [name, setName] = useState('');
    const [visitDate, setVisitDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && visitDate.trim()) {
            onAddVisitor(name, visitDate);
            setName('');
            setVisitDate('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generar Acceso para Visita">
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700">Nombre del Visitante</label>
                    <input
                        id="visitorName"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: Juan Rodríguez (Electricista)"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">Fecha y Hora de Visita</label>
                    <input
                        id="visitDate"
                        type="text"
                        value={visitDate}
                        onChange={e => setVisitDate(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: Hoy, 2:00 PM"
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Generar</button>
                </div>
            </form>
        </Modal>
    );
};

const initialVisitors: Visitor[] = [
    { id: 'vis1', name: 'Juan Rodríguez (Electricista)', visitDate: 'Hoy, 2:00 PM', accessCode: '84319', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=84319', status: 'pending' },
    { id: 'vis2', name: 'Familia González', visitDate: 'Ayer, 6:00 PM', accessCode: '12567', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=12567', status: 'departed' },
    { id: 'vis3', name: 'Servicio de Paquetería', visitDate: 'Antier, 11:00 AM', accessCode: '55832', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=55832', status: 'cancelled' },
];

const getStatusChip = (status: Visitor['status']) => {
    switch (status) {
        case 'pending':
            return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-200 rounded-full capitalize">Pendiente</span>;
        case 'arrived':
            return <span className="px-2 py-1 text-xs font-semibold text-teal-800 bg-teal-200 rounded-full">Llegó</span>;
        case 'departed':
            return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">Se retiró</span>;
        case 'cancelled':
            return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Cancelado</span>;
    }
};

const VisitorCard: React.FC<{ 
    visitor: Visitor;
    onArrive: (id: string) => void;
    onCancel: (id: string) => void;
}> = ({ visitor, onArrive, onCancel }) => {
    
    const handleShare = async () => {
        const shareData = {
            title: 'Acceso a Rinconada de Ceibas',
            text: `Hola, te comparto el acceso para tu visita.\n\nVisitante: ${visitor.name}\nFecha: ${visitor.visitDate}\nCódigo: ${visitor.accessCode}`,
        };

        try {
            const response = await fetch(visitor.qrUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const file = new File([blob], 'acceso-qr.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    ...shareData,
                    files: [file],
                });
            } else if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('La función de compartir no es compatible con tu navegador.');
            }
        } catch (error) {
            console.error('Error al compartir con imagen, intentando solo texto:', error);
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (shareError) {
                    console.error('Error al compartir solo texto:', shareError);
                    alert('No se pudo compartir el acceso. Por favor, inténtalo de nuevo.');
                }
            } else {
                alert('La función de compartir no es compatible con tu navegador.');
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg mb-4 p-4 transition-shadow hover:shadow-2xl">
            <div className="flex items-center">
                <img src={visitor.qrUrl} alt="QR Code" className="w-20 h-20 mr-4"/>
                <div className="flex-grow">
                    <p className="font-bold text-gray-800">{visitor.name}</p>
                    <p className="text-sm text-gray-600">Fecha: {visitor.visitDate}</p>
                    <p className="text-sm text-gray-600">Código: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{visitor.accessCode}</span></p>
                    <div className="mt-1">{getStatusChip(visitor.status)}</div>
                </div>
            </div>
            {visitor.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end items-center space-x-2">
                    <button onClick={handleShare} className="p-2 text-gray-500 hover:text-primary rounded-full transition-colors" title="Compartir">
                        <ShareIcon />
                    </button>
                    <button onClick={() => onCancel(visitor.id)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-semibold">Cancelar</button>
                    <button onClick={() => onArrive(visitor.id)} className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-focus font-semibold">Registrar Llegada</button>
                </div>
            )}
        </div>
    );
};

const AccessView: React.FC = () => {
    const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
    const [isNewVisitorModalOpen, setIsNewVisitorModalOpen] = useState(false);
    
    const handleMarkArrived = (visitorId: string) => {
        setVisitors(visitors.map(v => 
            v.id === visitorId ? { ...v, status: 'arrived' } : v
        ));
    };

    const handleCancelVisit = (visitorId: string) => {
        setVisitors(visitors.map(v => 
            v.id === visitorId ? { ...v, status: 'cancelled' } : v
        ));
    };

    const handleAddVisitor = (name: string, visitDate: string) => {
        const accessCode = Math.floor(10000 + Math.random() * 90000).toString();
        const newVisitor: Visitor = {
            id: `vis${Date.now()}`,
            name,
            visitDate,
            accessCode,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${accessCode}`,
            status: 'pending',
        };
        setVisitors(prev => [newVisitor, ...prev]);
        setIsNewVisitorModalOpen(false);
    };
    
    const pendingVisitors = visitors.filter(v => v.status === 'pending');
    const pastVisitors = visitors.filter(v => v.status !== 'pending');

    return (
        <div>
             <NewVisitorModal
                isOpen={isNewVisitorModalOpen}
                onClose={() => setIsNewVisitorModalOpen(false)}
                onAddVisitor={handleAddVisitor}
            />
            <div className="mb-4 text-right">
                 <button 
                    onClick={() => setIsNewVisitorModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors font-semibold shadow-md"
                >
                    Generar Acceso
                </button>
            </div>

            <h2 className="text-xl font-bold mb-3 text-gray-700">Próximas Visitas</h2>
            {pendingVisitors.length > 0 ? (
                pendingVisitors.map(visitor => <VisitorCard key={visitor.id} visitor={visitor} onArrive={handleMarkArrived} onCancel={handleCancelVisit} />)
            ) : (
                <p className="text-center text-gray-500 my-4">No hay visitas pendientes.</p>
            )}

            <h2 className="text-xl font-bold mt-6 mb-3 text-gray-700">Historial de Visitas</h2>
             {pastVisitors.length > 0 ? (
                pastVisitors.map(visitor => <VisitorCard key={visitor.id} visitor={visitor} onArrive={handleMarkArrived} onCancel={handleCancelVisit} />)
            ) : (
                 <p className="text-center text-gray-500 my-4">No hay visitas en el historial.</p>
            )}
        </div>
    );
};

export default AccessView;