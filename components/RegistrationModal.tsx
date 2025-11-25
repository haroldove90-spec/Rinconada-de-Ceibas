import React, { useState } from 'react';
import Modal from './Modal';
import { useUser } from '../context/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanup = () => {
    setEmail('');
    setPassword('');
    setName('');
    setHouseNumber('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isLoginView) {
            const { error } = await login(email, password);
            if (error) throw error;
            cleanup();
        } else {
            // Validation for registration
            if (!name.trim() || !houseNumber.trim()) {
                throw new Error('Nombre y número de casa son obligatorios.');
            }
            const num = parseInt(houseNumber, 10);
            if (isNaN(num)) {
                 throw new Error('El número de casa debe ser válido.');
            }

            const { error } = await register(email, password, name, num);
            if (error) throw error;
            cleanup();
        }
    } catch (err: any) {
        console.error(err);
        let msg = err.message || 'Ocurrió un error. Verifica tus credenciales.';
        
        // Translate common Supabase errors
        if (msg.includes('already registered')) msg = 'Este correo ya está registrado.';
        if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
        if (msg.includes('Password should be')) msg = 'La contraseña debe tener al menos 6 caracteres.';

        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const toggleView = () => {
      setIsLoginView(!isLoginView);
      setError('');
  }

  return (
    <Modal isOpen={isOpen} onClose={cleanup} title={isLoginView ? "Iniciar Sesión" : "Crear Cuenta"}>
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Login/Register Fields */}
        <div className="mb-4">
          <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            id="auth-email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="auth-pass" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            id="auth-pass"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
            placeholder="******"
          />
        </div>

        {/* Extra fields for Registration */}
        {!isLoginView && (
            <>
                <div className="mb-4">
                    <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input
                        type="text"
                        id="reg-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required={!isLoginView}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: María Rodríguez"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="reg-house" className="block text-sm font-medium text-gray-700">Número de Casa</label>
                    <input
                        type="number"
                        id="reg-house"
                        value={houseNumber}
                        onChange={e => setHouseNumber(e.target.value)}
                        required={!isLoginView}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
                        placeholder="Ej: 42"
                    />
                </div>
            </>
        )}

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
        
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between items-center">
          <button 
            type="button" 
            onClick={toggleView} 
            className="text-sm text-primary hover:underline mt-4 sm:mt-0"
          >
              {isLoginView ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia Sesión"}
          </button>
          
          <div className="flex w-full sm:w-auto">
            <button type="button" onClick={cleanup} className="flex-1 sm:flex-none mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                Cancelar
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 sm:flex-none px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Procesando...' : (isLoginView ? 'Entrar' : 'Registrarme')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;