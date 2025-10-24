import React, { useState, useRef } from 'react';
import { Post, Comment } from '../types';
import { HeartIcon, ChatBubbleLeftIcon, CameraIcon, PaperClipIcon } from '../components/icons/Icons';
import { useUser } from '../context/UserContext';
import Modal from '../components/Modal';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (content: string, imageUrl?: string) => void;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setContent('');
    setImage(null);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset file input to allow re-selecting the same file
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddPost(content, image || undefined);
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Publicación">
      <form onSubmit={handleSubmit} autoComplete="off">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué está pasando en la comunidad?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-100 text-black resize-none"
          rows={5}
          required
        />
        {image && (
          <div className="mt-4 relative">
            <img src={image} alt="Previsualización" className="rounded-lg w-full max-h-60 object-contain bg-gray-200" />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 leading-none hover:bg-opacity-50"
              aria-label="Quitar imagen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-3 text-gray-500">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange}
                className="hidden" 
                accept="image/*" 
                capture="environment"
            />
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="hover:text-primary"
                aria-label="Tomar o seleccionar foto"
            >
                <CameraIcon />
            </button>
            <button type="button" className="hover:text-primary"><PaperClipIcon /></button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus disabled:bg-gray-400"
            disabled={!content.trim()}
          >
            Publicar
          </button>
        </div>
      </form>
    </Modal>
  );
};

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

const PostCard: React.FC<{ post: Post; onAddComment: (postId: string, commentText: string) => void; }> = ({ post, onAddComment }) => {
    const [liked, setLiked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const { currentUser } = useUser();

    const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() && currentUser) {
        onAddComment(post.id, newComment.trim());
        setNewComment('');
      }
    };

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
             <div className="bg-light border-t border-gray-200">
                {post.comments.length > 0 && (
                    <div className="p-4 space-y-3">
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start">
                                <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full mr-3 mt-1 flex-shrink-0"/>
                                <div className="bg-white rounded-lg px-3 py-2 text-sm w-full">
                                   <p><span className="font-semibold text-gray-800">{comment.author.name}</span></p>
                                   <p className="text-gray-600 break-words">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {currentUser && (
                    <div className={`p-4 ${post.comments.length > 0 ? 'border-t border-gray-100' : ''}`}>
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <img src={currentUser.avatarUrl} alt="Tu avatar" className="h-8 w-8 rounded-full flex-shrink-0" />
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Añade un comentario..."
                                className="w-full bg-white border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-primary text-white rounded-full p-2 hover:bg-primary-focus disabled:bg-gray-300 transition-colors flex-shrink-0"
                                aria-label="Publicar comentario"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const HomeView: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const { currentUser } = useUser();
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

    const handleAddPost = (content: string, imageUrl?: string) => {
        if (!currentUser) return;
        const newPost: Post = {
            id: `post${Date.now()}`,
            author: currentUser,
            content,
            timestamp: 'Ahora mismo',
            likes: 0,
            comments: [],
            imageUrl,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setIsNewPostModalOpen(false);
    };

    const handleAddComment = (postId: string, commentText: string) => {
        if (!currentUser) return;
        const newComment: Comment = {
            id: `c${Date.now()}`,
            author: currentUser,
            content: commentText,
            timestamp: 'Ahora mismo',
        };
        setPosts(posts => posts.map(post => {
            if (post.id === postId) {
                return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
        }));
    };

    return (
        <div>
             <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex items-center">
                <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="h-10 w-10 rounded-full mr-4" />
                <button
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="w-full text-left bg-gray-100 rounded-full py-2 px-4 text-gray-500 hover:bg-gray-200 transition"
                >
                    ¿Qué está pasando en la comunidad?
                </button>
            </div>
            <NewPostModal
                isOpen={isNewPostModalOpen}
                onClose={() => setIsNewPostModalOpen(false)}
                onAddPost={handleAddPost}
            />
            {posts.map(post => <PostCard key={post.id} post={post} onAddComment={handleAddComment} />)}
        </div>
    );
};

export default HomeView;