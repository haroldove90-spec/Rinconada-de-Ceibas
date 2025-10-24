import React, { useState } from 'react';
import { MaintenanceReport, ReportStatus } from '../types';
import { useUser } from '../context/UserContext';

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

    const handleResolveReport = (reportId: string) => {
        setReports(reports.map(report => 
            report.id === reportId 
            ? { ...report, status: ReportStatus.Resolved } 
            : report
        ));
    };

    return (
        <div>
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