
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
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const newVisitor: Visitor = {
            id: `vis${Date.now()}`,
            name,
            visitDate: date,
            accessCode: code,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`,
            status: 'pending'
        };
        onAddVisitor(newVisitor);
        setName('');
        setDate('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Visita">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Visitante</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md focus:ring-primary focus:border-primary" />
                </div>
                <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha y Hora Estimada</label>
                    <input type="text" id="date" value={date} onChange={e => setDate(e.target.value)} required placeholder='Ej: Mañana, 4 PM' className="mt-1 block w-full p-2 border rounded-md focus:ring-primary focus:border-primary" />
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">Generar Acceso</button>
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
