import React, { useState, useRef } from 'react';
import { MaintenanceReport, ReportStatus, User } from '../types';
import Modal from '../components/Modal';

const mockUsers: { [key: string]: User } = {
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
};

const currentUser = mockUsers['user3'];

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

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


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

const ReportCard: React.FC<{ report: MaintenanceReport; onResolveReport: (id: string) => void; }> = ({ report, onResolveReport }) => {
    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            {report.imageUrl && <img src={report.imageUrl} alt="Reporte" className="w-full h-48 object-cover" />}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-primary">{report.category}</p>
                    {getStatusChip(report.status)}
                </div>
                <p className="text-gray-700 mb-3">{report.description}</p>
                <p className="text-sm text-gray-500">Reportado por {report.reporter.name} (Casa {report.reporter.houseNumber}) &middot; {report.timestamp}</p>
            </div>
             {report.status !== ReportStatus.Resolved && (
                <div className="px-4 pb-4 text-right">
                    <button 
                        onClick={() => onResolveReport(report.id)} 
                        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-amber-600 transition-colors font-semibold"
                    >
                        Marcar como Resuelto
                    </button>
                </div>
            )}
        </div>
    );
};

const NewReportModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void,
    onAddReport: (data: { category: string; description: string; imageUrl?: string }) => void 
}> = ({ isOpen, onClose, onAddReport }) => {
    const [category, setCategory] = useState('Alumbrado Público');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setImagePreview(base64);
            } catch (error) {
                console.error("Error converting file to base64:", error);
                setImagePreview(null);
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cleanup = () => {
        setCategory('Alumbrado Público');
        setDescription('');
        removeImage();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            // Simple validation
            alert("Por favor, ingresa una descripción para el reporte.");
            return;
        }
        onAddReport({
            category,
            description,
            imageUrl: imagePreview || undefined,
        });
        cleanup();
    };

    return (
        <Modal isOpen={isOpen} onClose={cleanup} title="Nuevo Reporte de Mantenimiento">
            <form onSubmit={handleSubmit}>
                 <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 bg-gray-100 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <option>Alumbrado Público</option>
                        <option>Seguridad</option>
                        <option>Jardinería</option>
                        <option>Limpieza</option>
                        <option>Otro</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-gray-900" placeholder="Describe el problema detalladamente..." required></textarea>
                </div>
                
                {imagePreview && (
                    <div className="mt-4 relative">
                        <img src={imagePreview} alt="Vista previa" className="rounded-lg w-full max-h-60 object-contain bg-gray-100" />
                        <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75" aria-label="Quitar imagen">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="mb-4 mt-4">
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Añadir Foto (Opcional)</label>
                    <input type="file" id="photo" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-focus cursor-pointer"/>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={cleanup} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Enviar Reporte</button>
                </div>
            </form>
        </Modal>
    );
};

const ReportsView: React.FC = () => {
    const [reports, setReports] = useState<MaintenanceReport[]>(initialReports);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddReport = (reportData: { category: string; description: string; imageUrl?: string }) => {
        const newReport: MaintenanceReport = {
            id: `rep${Date.now()}`,
            reporter: currentUser,
            category: reportData.category,
            description: reportData.description,
            imageUrl: reportData.imageUrl,
            status: ReportStatus.Reported,
            timestamp: 'Ahora mismo',
        };
        setReports([newReport, ...reports]);
    };

    const handleResolveReport = (reportId: string) => {
        setReports(reports.map(report => 
            report.id === reportId 
            ? { ...report, status: ReportStatus.Resolved } 
            : report
        ));
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-6 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105 flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Reportar un Incidente</span>
            </button>
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
            <NewReportModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onAddReport={handleAddReport}
            />
        </div>
    );
};

export default ReportsView;