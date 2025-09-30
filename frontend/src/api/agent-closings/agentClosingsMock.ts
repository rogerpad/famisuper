import { AgentClosing, CreateAgentClosingDto, UpdateAgentClosingDto } from './agentClosingsApi';

// Datos mock para proveedores de tipo agente
const mockAgentProviders = [
  { id: 1, nombre: 'Agente Principal', tipo: { id: 1, nombre: 'Agente' } },
  { id: 2, nombre: 'Agente Secundario', tipo: { id: 1, nombre: 'Agente' } },
  { id: 3, nombre: 'Agente Regional', tipo: { id: 1, nombre: 'Agente' } },
  { id: 4, nombre: 'Agente Local', tipo: { id: 1, nombre: 'Agente' } },
];

// Datos mock para cierres de agentes
const mockAgentClosings: AgentClosing[] = [
  {
    id: 1,
    proveedorId: 1,
    proveedor: { id: 1, nombre: 'Agente Principal' },
    fechaCierre: '2025-06-10',
    saldoInicial: 5000,
    adicionalCta: 2000,
    resultadoFinal: 8500,
    saldoFinal: 8600,
    diferencia: 100,
    observaciones: 'Cierre normal sin incidencias',
    estado: true,
    fechaCreacion: '2025-06-10T14:30:00',
    fechaActualizacion: '2025-06-10T15:00:00',
  },
  {
    id: 2,
    proveedorId: 2,
    proveedor: { id: 2, nombre: 'Agente Secundario' },
    fechaCierre: '2025-06-11',
    saldoInicial: 3000,
    adicionalCta: 1000,
    resultadoFinal: 4200,
    saldoFinal: 4150,
    diferencia: -50,
    observaciones: 'Pequeña diferencia a investigar',
    estado: false,
    fechaCreacion: '2025-06-11T16:45:00',
    fechaActualizacion: '2025-06-11T17:15:00',
  },
  {
    id: 3,
    proveedorId: 3,
    proveedor: { id: 3, nombre: 'Agente Regional' },
    fechaCierre: '2025-06-12',
    saldoInicial: 7500,
    adicionalCta: 3000,
    resultadoFinal: 12000,
    saldoFinal: 12000,
    diferencia: 0,
    observaciones: null,
    estado: true,
    fechaCreacion: '2025-06-12T18:20:00',
    fechaActualizacion: '2025-06-12T18:45:00',
  },
  {
    id: 4,
    proveedorId: 4,
    proveedor: { id: 4, nombre: 'Agente Local' },
    fechaCierre: '2025-06-13',
    saldoInicial: 2500,
    adicionalCta: 500,
    resultadoFinal: 3200,
    saldoFinal: 3250,
    diferencia: 50,
    observaciones: 'Diferencia positiva a favor',
    estado: true,
    fechaCreacion: '2025-06-13T09:10:00',
    fechaActualizacion: '2025-06-13T09:30:00',
  },
];

// Contador para IDs autoincrementales
let nextId = mockAgentClosings.length + 1;

// API mock para cierres de agentes
const agentClosingsMockApi = {
  // Obtener todos los cierres finales de agentes
  getAllAgentClosings: async (startDate?: string, endDate?: string): Promise<AgentClosing[]> => {
    let filteredClosings = [...mockAgentClosings];
    
    if (startDate) {
      filteredClosings = filteredClosings.filter(closing => 
        new Date(closing.fechaCierre) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredClosings = filteredClosings.filter(closing => 
        new Date(closing.fechaCierre) <= new Date(endDate)
      );
    }
    
    return Promise.resolve(filteredClosings);
  },
  
  // Calcular el resultado final para un agente en un rango de fechas
  calculateResultadoFinal: async (proveedorId: number, startDate: string, endDate: string): Promise<number> => {
    // Simulación de cálculo basado en el ID del proveedor
    const baseAmount = proveedorId * 1000;
    const randomFactor = Math.random() * 500 + 500; // Entre 500 y 1000
    return Promise.resolve(Math.round(baseAmount + randomFactor));
  },

  // Obtener un cierre final de agente por su ID
  getAgentClosingById: async (id: number): Promise<AgentClosing> => {
    const agentClosing = mockAgentClosings.find(closing => closing.id === id);
    if (!agentClosing) {
      return Promise.reject(new Error(`Cierre de agente con ID ${id} no encontrado`));
    }
    return Promise.resolve({ ...agentClosing });
  },

  // Crear un nuevo cierre final de agente
  createAgentClosing: async (data: CreateAgentClosingDto): Promise<AgentClosing> => {
    const provider = mockAgentProviders.find(p => p.id === data.proveedorId);
    
    const newAgentClosing: AgentClosing = {
      id: nextId++,
      proveedorId: data.proveedorId,
      proveedor: provider ? { id: provider.id, nombre: provider.nombre } : undefined,
      fechaCierre: data.fechaCierre,
      saldoInicial: data.saldoInicial,
      adicionalCta: data.adicionalCta,
      resultadoFinal: data.resultadoFinal,
      saldoFinal: data.saldoFinal,
      diferencia: data.diferencia,
      observaciones: data.observaciones || null,
      estado: data.estado !== undefined ? data.estado : true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };
    
    mockAgentClosings.push(newAgentClosing);
    return Promise.resolve({ ...newAgentClosing });
  },

  // Actualizar un cierre final de agente existente
  updateAgentClosing: async (id: number, data: UpdateAgentClosingDto): Promise<AgentClosing> => {
    const index = mockAgentClosings.findIndex(closing => closing.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Cierre de agente con ID ${id} no encontrado`));
    }
    
    // Si se actualiza el proveedor, actualizamos también la referencia
    let proveedor = mockAgentClosings[index].proveedor;
    if (data.proveedorId && data.proveedorId !== mockAgentClosings[index].proveedorId) {
      const provider = mockAgentProviders.find(p => p.id === data.proveedorId);
      if (provider) {
        proveedor = { id: provider.id, nombre: provider.nombre };
      }
    }
    
    mockAgentClosings[index] = {
      ...mockAgentClosings[index],
      ...data,
      proveedor,
      fechaActualizacion: new Date().toISOString(),
    };
    
    return Promise.resolve({ ...mockAgentClosings[index] });
  },

  // Eliminar un cierre final de agente
  deleteAgentClosing: async (id: number): Promise<void> => {
    const index = mockAgentClosings.findIndex(closing => closing.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Cierre de agente con ID ${id} no encontrado`));
    }
    
    mockAgentClosings.splice(index, 1);
    return Promise.resolve();
  },

  // Obtener todos los proveedores de tipo agente
  getAgentProviders: async () => {
    return Promise.resolve([...mockAgentProviders]);
  }
};

export default agentClosingsMockApi;
