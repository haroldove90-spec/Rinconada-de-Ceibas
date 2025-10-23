import React, { useState } from 'react';
import { Visitor } from '../types';
import Modal from '../components/Modal';

const initialVisitors: Visitor[] = [
    { id: 'vis1', name: 'Juan Rodríguez (Electricista)', visitDate: 'Hoy, 2:00 PM', accessCode: '84319', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=84319', status: 'pending' },
    { id: 'vis2', name: 'Familia González', visitDate: 'Ayer, 6:00 PM', accessCode: '12567', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=12567', status: 'departed' },
];

const VisitorCard: React.FC<{ visitor: Visitor }> = ({ visitor }) => {
    return (
        <div className="bg-white rounded-lg shadow-md mb-4 p-4 flex items-center">
            <img src={visitor.qrUrl} alt="QR Code" className="w-20 h-20 mr-4"/>
            <div>
                <p className="font-bold text-gray-800">{visitor.name}</p>
                <p className="text-sm text-gray-600">Fecha: {visitor.visitDate}</p>
                <p className="text-sm text-gray-600">Código: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{visitor.accessCode}</span></p>
                <p className="text-sm text-gray-600 capitalize">Estado: {visitor.status}</p>
            </div>
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
        return new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(date);
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
        const newVisitor: Visitor = {
            id: `vis${Date.now()}`,
            name,
            visitDate: formatDateTime(visitDate, visitTime),
            accessCode: code,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`,
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
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" placeholder="Ej: Juan Pérez (Plomero)"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">Fecha de la Visita</label>
                        <input type="date" id="visitDate" value={visitDate} onChange={e => setVisitDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700">Hora Estimada</label>
                        <input type="time" id="visitTime" value={visitTime} onChange={e => setVisitTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" />
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
    
    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105">
                Registrar Visita
            </button>

            <h2 className="text-xl font-bold mb-3 text-gray-700">Próximas Visitas</h2>
            {visitors.filter(v => v.status === 'pending').map(visitor => <VisitorCard key={visitor.id} visitor={visitor} />)}

            <h2 className="text-xl font-bold mt-6 mb-3 text-gray-700">Visitas Anteriores</h2>
            {visitors.filter(v => v.status !== 'pending').map(visitor => <VisitorCard key={visitor.id} visitor={visitor} />)}

            <NewVisitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddVisitor={addVisitor} />
        </div>
    );
};

export default AccessView;