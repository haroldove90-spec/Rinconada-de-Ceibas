import React, { useState } from 'react';
import { MaintenanceReport, ReportStatus } from '../types';
import { useUser } from '../context/UserContext';
import Modal from '../components/Modal';

const NewReportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddReport: (category: string, description: string) => void;
}> = ({ isOpen, onClose, onAddReport }) => {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const reportCategories = ["Alumbrado Público", "Jardinería", "Seguridad", "Limpieza", "Infraestructura", "Otro"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category.trim() && description.trim()) {
            onAddReport(category, description);
            setCategory('');
            setDescription('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Levantar Reporte de Mantenimiento">
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                        id="category"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        required
                    >
                        <option value="" disabled>Selecciona una categoría</option>
                        {reportCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black resize-none"
                        rows={4}
                        placeholder="Describe detalladamente el incidente..."
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Enviar Reporte</button>
                </div>
            </form>
        </Modal>
    );
};

const initialReports: MaintenanceReport[] = [
    {
        id: 'rep1',
        reporter: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' },
        category: 'Alumbrado Público',
        description: 'La lámpara del poste frente a la casa 28 está parpadeando desde anoche.',
        status: ReportStatus.Reported,
        timestamp: 'Hace 5 horas'
    },
    {
        id: 'rep2',
        reporter: { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'user' },
        category: 'Seguridad',
        description: 'La puerta de acceso peatonal no cierra automáticamente. Hay que jalarla fuerte.',
        imageUrl: 'https://picsum.photos/seed/gate/400/300',
        status: ReportStatus.InProgress,
        timestamp: 'Hace 2 días'
    },
    {
        id: 'rep3',
        reporter: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' },
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
            return <span className="px-2 py-1 text-xs font-semibold text-teal-800 bg-teal-200 rounded-full">{status}</span>;
        case ReportStatus.Resolved:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{status}</span>;
    }
};

const ReportCard: React.FC<{ report: MaintenanceReport; onResolveReport: (id: string) => void; }> = ({ report, onResolveReport }) => {
    const { currentUser } = useUser();
    
    return (
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
            {report.imageUrl && <img src={report.imageUrl} alt="Reporte" className="w-full h-48 object-cover" />}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-primary">{report.category}</p>
                    {getStatusChip(report.status)}
                </div>
                <p className="text-gray-700 mb-3">{report.description}</p>
                <p className="text-sm text-gray-500">Reportado por {report.reporter.name} (Casa {report.reporter.houseNumber}) &middot; {report.timestamp}</p>
            </div>
             {currentUser?.role === 'admin' && report.status !== ReportStatus.Resolved && (
                <div className="px-4 pb-4 text-right">
                    <button 
                        onClick={() => onResolveReport(report.id)} 
                        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-orange-700 transition-colors font-semibold"
                    >
                        Marcar como Resuelto
                    </button>
                </div>
            )}
        </div>
    );
};

const ReportsView: React.FC = () => {
    const [reports, setReports] = useState<MaintenanceReport[]>(initialReports);
    const { currentUser } = useUser();
    const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

    const handleResolveReport = (reportId: string) => {
        setReports(reports.map(report => 
            report.id === reportId 
            ? { ...report, status: ReportStatus.Resolved } 
            : report
        ));
    };

    const handleAddReport = (category: string, description: string) => {
        if (!currentUser) return;
        const newReport: MaintenanceReport = {
            id: `rep${Date.now()}`,
            reporter: currentUser,
            category,
            description,
            status: ReportStatus.Reported,
            timestamp: 'Ahora mismo',
        };
        setReports(prev => [newReport, ...prev]);
        setIsNewReportModalOpen(false);
    };

    return (
        <div>
            <NewReportModal
                isOpen={isNewReportModalOpen}
                onClose={() => setIsNewReportModalOpen(false)}
                onAddReport={handleAddReport}
            />
            <div className="mb-4 text-right">
                <button 
                    onClick={() => setIsNewReportModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors font-semibold shadow-md"
                >
                    Levantar Reporte
                </button>
            </div>
            {reports.length > 0 ? (
                reports.map(report => <ReportCard key={report.id} report={report} onResolveReport={handleResolveReport} />)
            ) : (
                <div className="text-center py-10 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">¡Todo en orden!</h3>
                    <p className="mt-1 text-sm text-gray-500">No hay reportes de mantenimiento activos en este momento.</p>
                </div>
            )}
        </div>
    );
};

export default ReportsView;