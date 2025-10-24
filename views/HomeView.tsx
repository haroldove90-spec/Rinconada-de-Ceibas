import React, { useState, useCallback, useEffect } from 'react';
import { Post, User } from '../types';
import { HeartIcon, ChatBubbleLeftIcon, PaperClipIcon, CameraIcon } from '../components/icons/Icons';
import Modal from '../components/Modal';
import { generateAnnouncement } from '../services/geminiService';
import { useUser } from '../context/UserContext';


const initialPosts: Post[] = [
    {
        id: 'post1',
        author: { id: 'user1', name: 'Admin', houseNumber: 0, avatarUrl: 'https://i.pravatar.cc/150?u=admin', role: 'admin' },
        content: 'Recordatorio: La fumigación de áreas comunes se realizará este sábado a las 8 AM. Por favor, mantengan sus ventanas cerradas y eviten que las mascotas salgan durante la mañana.',
        timestamp: 'Hace 2 horas',
        likes: 15,
        comments: [
            { id: 'c1', author: { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: 'user' }, content: '¡Gracias por el aviso!', timestamp: 'Hace 1 hora' }
        ],
        imageUrl: 'https://picsum.photos/seed/fumigacion/600/400',
    },
    {
        id: 'post2',
        author: { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'user' },
        content: 'Hola vecinos, encontré un juego de llaves cerca del área de juegos. Si son de alguien, contáctenme. Soy de la casa 12.',
        timestamp: 'Hace 1 día',
        likes: 22,
        comments: []
    },
];

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [liked, setLiked] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
            <div className="p-5">
                <div className="flex items-center mb-4">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full mr-4 border-2 border-primary" />
                    <div>
                        <p className="font-bold text-gray-800 text-lg">{post.author.name}</p>
                        <p className="text-sm text-gray-500">Casa {post.author.houseNumber} &middot; {post.timestamp}</p>
                    </div>
                </div>
                <p className="text-gray-700 mb-4 text-base leading-relaxed">{post.content}</p>

                {post.imageUrl && (
                    <div className="mt-4">
                        <img src={post.imageUrl} alt="Contenido de la publicación" className="rounded-lg w-full max-h-96 object-cover" />
                    </div>
                )}
                {post.videoUrl && (
                    <div className="mt-4">
                        <video controls className="rounded-lg w-full max-h-96">
                            <source src={post.videoUrl} />
                            Tu navegador no soporta el tag de video.
                        </video>
                    </div>
                )}
                
                <div className="flex items-center text-gray-500 pt-3 border-t border-slate-100 mt-4">
                    <button onClick={() => setLiked(!liked)} className={`flex items-center mr-6 transition-colors duration-200 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                        <HeartIcon filled={liked} />
                        <span className="ml-2 text-sm font-medium">{post.likes + (liked ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center hover:text-primary transition-colors duration-200">
                        <ChatBubbleLeftIcon />
                        <span className="ml-2 text-sm font-medium">{post.comments.length}</span>
                    </button>
                </div>
            </div>
             {post.comments.length > 0 && (
                <div className="bg-light p-4 border-t border-gray-200">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start mb-2 last:mb-0">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full mr-3 mt-1"/>
                            <div className="bg-white rounded-lg px-3 py-2 text-sm">
                               <p><span className="font-semibold text-gray-800">{comment.author.name}</span></p>
                               <p className="text-gray-600">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const NewPostModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onAddPost: (postData: { content: string; imageUrl?: string; videoUrl?: string }) => void
}> = ({ isOpen, onClose, onAddPost }) => {
    const [content, setContent] = useState(() => sessionStorage.getItem('newPostContent') || '');
    const [aiPrompt, setAiPrompt] = useState(() => sessionStorage.getItem('newPostAiPrompt') || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            sessionStorage.setItem('newPostContent', content);
        }
    }, [content, isOpen]);

    useEffect(() => {
        if (isOpen) {
            sessionStorage.setItem('newPostAiPrompt', aiPrompt);
        }
    }, [aiPrompt, isOpen]);

    const handleGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        const generatedContent = await generateAnnouncement(`Crea un anuncio para la comunidad sobre: ${aiPrompt}`);
        setContent(generatedContent);
        setIsGenerating(false);
    };

    const removeMedia = useCallback(() => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    }, []);

    const cleanup = useCallback(() => {
        setContent('');
        setAiPrompt('');
        removeMedia();
        sessionStorage.removeItem('newPostContent');
        sessionStorage.removeItem('newPostAiPrompt');
        onClose();
    }, [onClose, removeMedia]);
    
    const handleMediaChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            removeMedia(); // Clear previous media
            setMediaFile(file);
            setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
            try {
                const base64Data = await fileToBase64(file);
                setMediaPreview(base64Data);
            } catch (error) {
                console.error("Error converting file to Base64:", error);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() || mediaFile) {
            const postData: { content: string; imageUrl?: string; videoUrl?: string } = { content };
             if (mediaType === 'image' && mediaPreview) {
                postData.imageUrl = mediaPreview;
            } else if (mediaType === 'video' && mediaPreview) {
                postData.videoUrl = mediaPreview;
            }
            onAddPost(postData);
            cleanup();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={cleanup} title="Crear Anuncio">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Necesitas ayuda? Genera el texto con IA:</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ej: recordar pago de cuotas el día 15"
                            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                            autoComplete="off"
                        />
                         <button type="button" onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 bg-secondary text-white font-semibold rounded-r-md hover:bg-fuchsia-600 disabled:bg-gray-400 flex items-center justify-center w-24">
                             {isGenerating ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                             ) : 'Generar'}
                         </button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="O escribe tu anuncio aquí..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-gray-900"
                ></textarea>

                {mediaPreview && (
                    <div className="mt-4 relative">
                        {mediaType === 'image' && <img src={mediaPreview} alt="Vista previa" className="rounded-lg w-full max-h-60 object-contain bg-gray-100" />}
                        {mediaType === 'video' && <video controls src={mediaPreview} className="rounded-lg w-full max-h-60 bg-black" />}
                        <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75" aria-label="Quitar multimedia">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} ref={fileInputRef} className="hidden" id="media-upload"/>
                        <label htmlFor="media-upload" className="cursor-pointer text-primary hover:text-primary-focus p-2 rounded-full inline-block" title="Adjuntar foto o video">
                             <PaperClipIcon />
                        </label>
                        <input type="file" accept="image/*" capture="environment" onChange={handleMediaChange} ref={cameraInputRef} className="hidden" id="camera-upload"/>
                        <label htmlFor="camera-upload" className="cursor-pointer text-primary hover:text-primary-focus p-2 rounded-full inline-block" title="Tomar foto">
                             <CameraIcon />
                        </label>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={cleanup} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Publicar</button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

const HomeView: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUser } = useUser();

    useEffect(() => {
        if (sessionStorage.getItem('newPostModalOpen') === 'true') {
            setIsModalOpen(true);
        }
    }, []);

    const openModal = () => {
        sessionStorage.setItem('newPostModalOpen', 'true');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        sessionStorage.removeItem('newPostModalOpen');
        setIsModalOpen(false);
    };

    const addPost = (postData: { content: string; imageUrl?: string; videoUrl?: string }) => {
        if (!currentUser) return;
        const newPost: Post = {
            id: `post${Date.now()}`,
            author: currentUser,
            content: postData.content,
            imageUrl: postData.imageUrl,
            videoUrl: postData.videoUrl,
            timestamp: 'Ahora mismo',
            likes: 0,
            comments: [],
        };
        setPosts([newPost, ...posts]);
    };
    
    return (
        <div>
            {currentUser && currentUser.role === 'admin' && (
                <button onClick={openModal} className="w-full mb-6 text-left text-gray-500 rounded-xl transition-shadow bg-gradient-to-r from-primary to-accent p-0.5 shadow-lg hover:shadow-xl">
                    <div className="bg-white p-4 rounded-[10px] flex items-center">
                         <img src={currentUser.avatarUrl} className="h-10 w-10 rounded-full mr-4" alt="user avatar"/>
                         <span>¿Qué está pasando en la privada?</span>
                    </div>
                </button>
            )}
            
            {posts.map(post => <PostCard key={post.id} post={post} />)}
            
            <NewPostModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                onAddPost={addPost}
            />
        </div>
    );
};

export default HomeView;