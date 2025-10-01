import { Turno, CreateTurnoDto, UpdateTurnoDto } from './turnosApi';

// Datos de ejemplo para turnos
const mockTurnos: Turno[] = [
  {
    id: 1,
    nombre: 'Turno Mañana',
    usuarioId: 1,
    horaInicio: '08:00',
    horaFin: '14:00',
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
    usuarioId: 2,
    horaInicio: '14:00',
    horaFin: '20:00',
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
    usuarioId: 3,
    horaInicio: '20:00',
    horaFin: '08:00',
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

  // Obtener turnos por usuarioId
  getByUsuarioId: async (usuarioId: number): Promise<Turno[]> => {
    const turnos = mockTurnos.filter(t => t.usuarioId === usuarioId);
    return Promise.resolve([...turnos]);
  },

  // Crear un nuevo turno
  create: async (turnoData: CreateTurnoDto): Promise<Turno> => {
    const newTurno: Turno = {
      id: nextId++,
      nombre: turnoData.nombre,
      horaInicio: turnoData.horaInicio,
      horaFin: turnoData.horaFin,
      usuarioId: turnoData.usuarioId,
      descripcion: turnoData.descripcion || '',
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
  },
  
  // Asignar usuarios a un turno (mock)
  asignarUsuarios: async (turnoId: number, usuariosIds: number[]): Promise<void> => {
    return Promise.resolve();
  },
  
  // Obtener usuarios por turno (mock)
  getUsuariosPorTurno: async (turnoId: number): Promise<any[]> => {
    return Promise.resolve([]);
  },
  
  // Obtener turnos por usuario (mock)
  getTurnosPorUsuario: async (usuarioId: number): Promise<Turno[]> => {
    return Promise.resolve([]);
  },
  
  // Iniciar un turno (actualizar la hora de inicio con la hora actual)
  iniciarTurno: async (id: number): Promise<Turno> => {
    const index = mockTurnos.findIndex(t => t.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    
    mockTurnos[index] = {
      ...mockTurnos[index],
      horaInicio: new Date().toTimeString().slice(0, 5)
    };
    
    return Promise.resolve({...mockTurnos[index]});
  },
  
  // Finalizar un turno (actualizar la hora de fin con la hora actual)
  finalizarTurno: async (id: number): Promise<Turno> => {
    const index = mockTurnos.findIndex(t => t.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    
    mockTurnos[index] = {
      ...mockTurnos[index],
      horaFin: new Date().toTimeString().slice(0, 5)
    };
    
    return Promise.resolve({...mockTurnos[index]});
  },
  
  // Iniciar un turno como vendedor (actualizar la hora de inicio con la hora actual)
  iniciarTurnoVendedor: async (id: number): Promise<Turno> => {
    // Reutilizamos la lógica de iniciarTurno
    return turnosMockApi.iniciarTurno(id);
  },
  
  // Finalizar un turno como vendedor (actualizar la hora de fin con la hora actual)
  finalizarTurnoVendedor: async (id: number): Promise<Turno> => {
    // Reutilizamos la lógica de finalizarTurno
    return turnosMockApi.finalizarTurno(id);
  },
  
  // Reiniciar un turno (eliminar hora de inicio y fin)
  reiniciarTurno: async (id: number): Promise<Turno> => {
    const index = mockTurnos.findIndex(t => t.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Turno no encontrado'));
    }
    
    mockTurnos[index] = {
      ...mockTurnos[index],
      horaInicio: '',
      horaFin: ''
    };
    
    return Promise.resolve({...mockTurnos[index]});
  }
};

export default turnosMockApi;
