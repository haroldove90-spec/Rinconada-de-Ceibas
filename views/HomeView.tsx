
import React, { useState, useCallback } from 'react';
import { Post, User } from '../types';
import { HeartIcon, ChatBubbleLeftIcon } from '../components/icons/Icons';
import Modal from '../components/Modal';
import { generateAnnouncement } from '../services/geminiService';


const mockUsers: { [key: string]: User } = {
    'user1': { id: 'user1', name: 'Admin', houseNumber: 0, avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
    'user2': { id: 'user2', name: 'Carlos Pérez', houseNumber: 12, avatarUrl: 'https://picsum.photos/seed/carlos/100/100' },
    'user3': { id: 'user3', name: 'Ana Gómez', houseNumber: 25, avatarUrl: 'https://picsum.photos/seed/ana/100/100' },
};

const initialPosts: Post[] = [
    {
        id: 'post1',
        author: mockUsers['user1'],
        content: 'Recordatorio: La fumigación de áreas comunes se realizará este sábado a las 8 AM. Por favor, mantengan sus ventanas cerradas.',
        timestamp: 'Hace 2 horas',
        likes: 15,
        comments: [
            { id: 'c1', author: mockUsers['user3'], content: '¡Gracias por el aviso!', timestamp: 'Hace 1 hora' }
        ]
    },
    {
        id: 'post2',
        author: mockUsers['user2'],
        content: 'Hola vecinos, encontré un juego de llaves cerca del área de juegos. Si son de alguien, contáctenme. Casa 12.',
        timestamp: 'Hace 1 día',
        likes: 22,
        comments: []
    },
];

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center mb-3">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full mr-3" />
                    <div>
                        <p className="font-bold text-gray-800">{post.author.name}</p>
                        <p className="text-sm text-gray-500">Casa {post.author.houseNumber} &middot; {post.timestamp}</p>
                    </div>
                </div>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <div className="flex items-center text-gray-500">
                    <button className="flex items-center mr-6 hover:text-red-500 transition-colors">
                        <HeartIcon />
                        <span className="ml-1 text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center hover:text-primary transition-colors">
                        <ChatBubbleLeftIcon />
                        <span className="ml-1 text-sm">{post.comments.length}</span>
                    </button>
                </div>
            </div>
             {post.comments.length > 0 && (
                <div className="bg-gray-50 p-4 border-t">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start mb-2 last:mb-0">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full mr-2 mt-1"/>
                            <div>
                               <p><span className="font-semibold text-sm text-gray-800">{comment.author.name}</span> <span className="text-gray-600 text-sm">{comment.content}</span></p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Generar con IA (Opcional)</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ej: recordar pago de cuotas"
                            className="flex-grow p-2 border rounded-l-md focus:ring-primary focus:border-primary"
                        />
                         <button type="button" onClick={handleGenerate} disabled={isGenerating} className="px-4 py-2 bg-secondary text-white rounded-r-md hover:bg-purple-600 disabled:bg-gray-400">
                             {isGenerating ? '...' : 'Crear'}
                         </button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    placeholder="¿Qué está pasando en la privada?"
                    className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                ></textarea>
                <div className="mt-4 flex justify-end">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">Publicar</button>
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
            id: `post${posts.length + 1}`,
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
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105">
                Crear un nuevo anuncio
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
