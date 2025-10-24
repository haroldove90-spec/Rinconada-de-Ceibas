import React, { useState } from 'react';
import Modal from './Modal';
import { useUser } from '../context/UserContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useUser();
  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [error, setError] = useState('');

  const cleanup = () => {
    setName('');
    setHouseNumber('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !houseNumber.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const num = parseInt(houseNumber, 10);
    if (isNaN(num) || num <= 0) {
      setError('El número de casa debe ser un número válido.');
      return;
    }

    addUser({ name, houseNumber: num });
    cleanup();
  };

  return (
    <Modal isOpen={isOpen} onClose={cleanup} title="Registrarse en la Comunidad">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-4">
          <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            id="reg-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
            placeholder="Ej: María Rodríguez"
            autoComplete="name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="reg-house" className="block text-sm font-medium text-gray-700">Número de Casa</label>
          <input
            type="number"
            id="reg-house"
            value={houseNumber}
            onChange={e => setHouseNumber(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-gray-100 text-black"
            placeholder="Ej: 42"
            autoComplete="off"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={cleanup} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus">Registrarme</button>
        </div>
      </form>
    </Modal>
  );
};

export default RegistrationModal;