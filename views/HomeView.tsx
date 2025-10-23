import React, { useState, useCallback } from 'react';
import { Post, User } from '../types';
import { HeartIcon, ChatBubbleLeftIcon } from '../components/icons/Icons';
import Modal from '../components/Modal';
import { generateAnnouncement } from '../services/geminiService';


const mockUsers: { [key: string]: User } = {
    'user1': { id: 'user1', name: 'Admin', houseNumber: 0, avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
};

const initialPosts: Post[] = [
    {
        id: 'post1',
        author: mockUsers['user1'],
        content: 'Recordatorio: La fumigación de áreas comunes se realizará este sábado a las 8 AM. Por favor, mantengan sus ventanas cerradas y eviten que las mascotas salgan durante la mañana.',
        timestamp: 'Hace 2 horas',
        likes: 15,
        comments: [
            { id: 'c1', author: mockUsers['user3'], content: '¡Gracias por el aviso!', timestamp: 'Hace 1 hora' }
        ]
    },
    {
        id: 'post2',
        author: mockUsers['user2'],
        content: 'Hola vecinos, encontré un juego de llaves cerca del área de juegos. Si son de alguien, contáctenme. Soy de la casa 12.',
        timestamp: 'Hace 1 día',
        likes: 22,
        comments: []
    },
];

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [liked, setLiked] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <div className="p-5">
                <div className="flex items-center mb-4">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full mr-4 border-2 border-primary" />
                    <div>
                        <p className="font-bold text-gray-800 text-lg">{post.author.name}</p>
                        <p className="text-sm text-gray-500">Casa {post.author.houseNumber} &middot; {post.timestamp}</p>
                    </div>
                </div>
                <p className="text-gray-700 mb-4 text-base leading-relaxed">{post.content}</p>
                <div className="flex items-center text-gray-500 pt-3 border-t border-gray-100">
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

const NewPostModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onAddPost: (content: string) => void
}> = ({ isOpen, onClose, onAddPost }) => {
    const [content, setContent] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        const generatedContent = await generateAnnouncement(`Crea un anuncio para la comunidad sobre: ${aiPrompt}`);
        setContent(generatedContent);
        setIsGenerating(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onAddPost(content);
            setContent('');
            setAiPrompt('');
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Anuncio">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Necesitas ayuda? Genera el texto con IA:</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ej: recordar pago de cuotas el día 15"
                            className="flex-grow p-2 border rounded-l-md focus:ring-primary focus:border-primary"
                        />
                         <button type="button" onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 bg-secondary text-white font-semibold rounded-r-md hover:bg-purple-600 disabled:bg-gray-400 flex items-center justify-center w-24">
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
                    className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
                    required
                ></textarea>
                <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Publicar</button>
                </div>
            </form>
        </Modal>
    )
}

const HomeView: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addPost = (content: string) => {
        const newPost: Post = {
            id: `post${Date.now()}`,
            author: mockUsers['user1'], // Assuming admin posts
            content,
            timestamp: 'Ahora mismo',
            likes: 0,
            comments: [],
        };
        setPosts([newPost, ...posts]);
    };
    
    return (
        <div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-6 bg-white p-4 text-left text-gray-500 rounded-lg shadow-md hover:shadow-lg transition-shadow border flex items-center">
                <img src={mockUsers['user1'].avatarUrl} className="h-10 w-10 rounded-full mr-4" alt="user avatar"/>
                <span>¿Qué está pasando en la privada?</span>
            </button>
            
            {posts.map(post => <PostCard key={post.id} post={post} />)}
            
            <NewPostModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddPost={addPost}
            />
        </div>
    );
};

export default HomeView;