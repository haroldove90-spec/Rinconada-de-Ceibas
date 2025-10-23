export enum View {
  Home = 'home',
  Packages = 'packages',
  Reports = 'reports',
  Access = 'access',
  Directory = 'directory',
}

export interface User {
  id: string;
  name: string;
  houseNumber: number;
  avatarUrl: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  imageUrl?: string;
  videoUrl?: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export enum ReportStatus {
    Reported = 'Reportado',
    InProgress = 'En Progreso',
    Resolved = 'Resuelto'
}

export interface MaintenanceReport {
    id: string;
    reporter: User;
    category: string;
    description: string;
    imageUrl?: string;
    status: ReportStatus;
    timestamp: string;
}

export enum PackageRequestStatus {
    Pending = 'Pendiente',
    Accepted = 'Aceptado',
    Completed = 'Completado'
}

export interface PackageRequest {
    id: string;
    requester: User;
    carrier: string;
    deliveryTime: string;
    status: PackageRequestStatus;
    helper?: User;
}

export interface Visitor {
    id: string;
    name: string;
    visitDate: string;
    accessCode: string;
    qrUrl: string;
    status: 'pending' | 'arrived' | 'departed' | 'cancelled';
}