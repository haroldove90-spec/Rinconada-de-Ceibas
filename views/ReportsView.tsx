
import React, { useState } from 'react';
import { MaintenanceReport, ReportStatus, User } from '../types';
import Modal from '../components/Modal';

const mockUsers: { [key: string]: User } = {
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://picsum.photos/seed/carlos/100/100' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://picsum.photos/seed/ana/100/100' },
};

const initialReports: MaintenanceReport[] = [
    {
        id: 'rep1',
        reporter: mockUsers['user3'],
        category: 'Alumbrado Público',
        description: 'La lámpara del poste frente a la casa 28 está parpadeando desde anoche.',
        status: ReportStatus.Reported,
        timestamp: 'Hace 5 horas'
    },
    {
        id: 'rep2',
        reporter: mockUsers['user2'],
        category: 'Seguridad',
        description: 'La puerta de acceso peatonal no cierra automáticamente. Hay que jalarla fuerte.',
        imageUrl: 'https://picsum.photos/seed/gate/400/300',
        status: ReportStatus.InProgress,
        timestamp: 'Hace 2 días'
    },
    {
        id: 'rep3',
        reporter: mockUsers['user3'],
        category: 'Jardinería',
        description: 'Se regó la manguera principal del jardín central.',
        status: ReportStatus.Resolved,
        timestamp: 'La semana pasada'
    },
];

const getStatusChip = (status: ReportStatus) => {
    switch (status) {
        case ReportStatus.Reported:
            return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">{status}</span>;
        case ReportStatus.InProgress:
            return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">{status}</span>;
        case ReportStatus.Resolved:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
    }
};

const ReportCard: React.FC<{ report: MaintenanceReport }> = ({ report }) => {
    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            {report.imageUrl && <img src={report.imageUrl} alt="Reporte" className="w-full h-40 object-cover" />}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-primary">{report.category}</p>
                    {getStatusChip(report.status)}
                </div>
                <p className="text-gray-700 mb-3">{report.description}</p>
                <p className="text-sm text-gray-500">Reportado por {report.reporter.name} (Casa {report.reporter.houseNumber}) &middot; {report.timestamp}</p>
            </div>
        </div>
    );
};

const NewReportModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Reporte de Mantenimiento">
            <form>
                 <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select id="category" className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <option>Alumbrado Público</option>
                        <option>Seguridad</option>
                        <option>Jardinería</option>
                        <option>Limpieza</option>
                        <option>Otro</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea id="description" rows={4} className="mt-1 block w-full p-2 border rounded-md focus:ring-primary focus:border-primary" placeholder="Describe el problema..."></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Añadir Foto (Opcional)</label>
                    <input type="file" id="photo" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-focus file:text-white hover:file:bg-primary"/>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">Enviar Reporte</button>
                </div>
            </form>
        </Modal>
    );
};

const ReportsView: React.FC = () => {
    const [reports] = useState<MaintenanceReport[]>(initialReports);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105">
                Reportar un Incidente
            </button>
            {reports.map(report => <ReportCard key={report.id} report={report} />)}
            <NewReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ReportsView;
