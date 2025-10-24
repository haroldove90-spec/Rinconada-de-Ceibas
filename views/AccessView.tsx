import React, { useState } from 'react';
import { Visitor } from '../types';
import Modal from '../components/Modal';
import { ShareIcon } from '../components/icons/Icons';

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
            // Attempt to fetch the QR code and share it as an image file for a better experience
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
                // Fallback to text-only if files can't be shared but share API exists
                await navigator.share(shareData);
            } else {
                alert('La función de compartir no es compatible con tu navegador.');
            }
        } catch (error) {
            console.error('Error al compartir con imagen, intentando solo texto:', error);
            // Fallback to sharing text only if fetching the image or sharing the file fails
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

const NewVisitorModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddVisitor: (visitor: Visitor) => void }> = ({ isOpen, onClose, onAddVisitor }) => {
    const [name, setName] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');

    const formatDateTime = (dateStr: string, timeStr: string): string => {
        if (!dateStr || !timeStr) return 'Fecha no especificada';
        const date = new Date(`${dateStr}T${timeStr}`);

        const datePart = new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'full',
        }).format(date);

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
        setName('');
        setVisitDate('');
        setVisitTime('');
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !visitDate || !visitTime) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const qrData = `Visitante: ${name}\nFecha: ${visitDate}\nHora: ${visitTime}\nCódigo: ${code}`;
        const newVisitor: Visitor = {
            id: `vis${Date.now()}`,
            name,
            visitDate: formatDateTime(visitDate, visitTime),
            accessCode: code,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`,
            status: 'pending'
        };
        onAddVisitor(newVisitor);
        cleanup();
    };

    return (
        <Modal isOpen={isOpen} onClose={cleanup} title="Registrar Nueva Visita">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Visitante</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900" placeholder="Ej: Juan Pérez (Plomero)" autoComplete="off"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">Fecha de la Visita</label>
                        <input type="date" id="visitDate" value={visitDate} onChange={e => setVisitDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700">Hora Estimada</label>
                        <input type="time" id="visitTime" value={visitTime} onChange={e => setVisitTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={cleanup} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Generar Acceso</button>
                </div>
            </form>
        </Modal>
    )
};

const AccessView: React.FC = () => {
    const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const addVisitor = (visitor: Visitor) => {
        setVisitors([visitor, ...visitors]);
    };

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
    
    const pendingVisitors = visitors.filter(v => v.status === 'pending');
    const pastVisitors = visitors.filter(v => v.status !== 'pending');

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105">
                Registrar Visita
            </button>

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


            <NewVisitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddVisitor={addVisitor} />
        </div>
    );
};

export default AccessView;