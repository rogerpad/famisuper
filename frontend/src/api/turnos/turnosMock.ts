import { Turno, CreateTurnoDto, UpdateTurnoDto } from './turnosApi';

// Datos de ejemplo para turnos
const mockTurnos: Turno[] = [
  {
    id: 1,
    nombre: 'Turno Mañana',
    usuario_id: 1,
    estado: 'Activo',
    descripcion: 'Turno de 8:00 AM a 2:00 PM',
    activo: true,
    usuario: {
      id: 1,
      username: 'usuario1',
      nombre: 'Juan',
      apellido: 'Pérez'
    }
  },
  {
    id: 2,
    nombre: 'Turno Tarde',
    usuario_id: 2,
    estado: 'Activo',
    descripcion: 'Turno de 2:00 PM a 8:00 PM',
    activo: true,
    usuario: {
      id: 2,
      username: 'usuario2',
      nombre: 'María',
      apellido: 'González'
    }
  },
  {
    id: 3,
    nombre: 'Turno Noche',
    usuario_id: 3,
    estado: 'Inactivo',
    descripcion: 'Turno de 8:00 PM a 8:00 AM',
    activo: false,
    usuario: {
      id: 3,
      username: 'usuario3',
      nombre: 'Carlos',
      apellido: 'Rodríguez'
    }
  }
];

// Contador para IDs de nuevos turnos
let nextId = mockTurnos.length + 1;

// API de mock para turnos
const turnosMockApi = {
  // Obtener todos los turnos
  getAll: async (): Promise<Turno[]> => {
    return Promise.resolve([...mockTurnos]);
  },

  // Obtener un turno por ID
  getById: async (id: number): Promise<Turno> => {
    const turno = mockTurnos.find(t => t.id === id);
    if (!turno) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    return Promise.resolve({...turno});
  },

  // Obtener turnos por usuario_id
  getByUsuarioId: async (usuarioId: number): Promise<Turno[]> => {
    const turnos = mockTurnos.filter(t => t.usuario_id === usuarioId);
    return Promise.resolve([...turnos]);
  },

  // Crear un nuevo turno
  create: async (turnoData: CreateTurnoDto): Promise<Turno> => {
    const newTurno: Turno = {
      id: nextId++,
      nombre: turnoData.nombre,
      usuario_id: turnoData.usuario_id,
      estado: turnoData.estado || 'Disponible',
      descripcion: turnoData.descripcion,
      activo: turnoData.activo ?? true,
      // Aquí normalmente se agregaría el usuario completo, pero en el mock no lo tenemos
    };
    mockTurnos.push(newTurno);
    return Promise.resolve({...newTurno});
  },

  // Actualizar un turno existente
  update: async (id: number, turnoData: UpdateTurnoDto): Promise<Turno> => {
    const index = mockTurnos.findIndex(t => t.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    
    mockTurnos[index] = {
      ...mockTurnos[index],
      ...turnoData
    };
    
    return Promise.resolve({...mockTurnos[index]});
  },

  // Eliminar un turno
  delete: async (id: number): Promise<void> => {
    const index = mockTurnos.findIndex(t => t.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    
    mockTurnos.splice(index, 1);
    return Promise.resolve();
  }
};

export default turnosMockApi;
