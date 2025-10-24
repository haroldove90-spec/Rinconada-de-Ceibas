import React, { useState } from 'react';
import { Post } from '../types';
import { HeartIcon, ChatBubbleLeftIcon } from '../components/icons/Icons';
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

const HomeView: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const { currentUser } = useUser();

    return (
        <div>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
    );
};

export default HomeView;