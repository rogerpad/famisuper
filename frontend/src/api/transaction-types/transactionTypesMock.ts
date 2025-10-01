import { TransactionType, CreateTransactionTypeDto, UpdateTransactionTypeDto } from './transactionTypesApi';

// Datos mock para tipos de transacción
const mockTransactionTypes: TransactionType[] = [
  {
    id: 1,
    nombre: 'Depósito',
    descripcion: 'Transacción de depósito de dinero',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Retiro',
    descripcion: 'Transacción de retiro de dinero',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Transferencia',
    descripcion: 'Transferencia de fondos entre cuentas',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Pago de Servicios',
    descripcion: 'Pago de servicios públicos y privados',
    activo: true,
  },
  {
    id: 5,
    nombre: 'Recarga',
    descripcion: 'Recarga de saldo para telefonía móvil',
    activo: true,
  },
  {
    id: 6,
    nombre: 'Consulta de Saldo',
    descripcion: 'Consulta de saldo disponible',
    activo: true,
  },
  {
    id: 7,
    nombre: 'Cambio de Divisas',
    descripcion: 'Cambio entre diferentes monedas',
    activo: false,
  },
];

// Contador para IDs autoincrementales
let nextId = mockTransactionTypes.length + 1;

// API mock para tipos de transacción
const transactionTypesMockApi = {
  // Obtener todos los tipos de transacción
  getAll: async (): Promise<TransactionType[]> => {
    return Promise.resolve([...mockTransactionTypes]);
  },

  // Obtener todos los tipos de transacción activos
  getActive: async (): Promise<TransactionType[]> => {
    return Promise.resolve(mockTransactionTypes.filter(type => type.activo));
  },

  // Obtener un tipo de transacción por ID
  getById: async (id: number): Promise<TransactionType> => {
    const transactionType = mockTransactionTypes.find(type => type.id === id);
    if (!transactionType) {
      return Promise.reject(new Error(`Tipo de transacción con ID ${id} no encontrado`));
    }
    return Promise.resolve({ ...transactionType });
  },

  // Crear un nuevo tipo de transacción
  create: async (data: CreateTransactionTypeDto): Promise<TransactionType> => {
    const newTransactionType: TransactionType = {
      id: nextId++,
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo: data.activo !== undefined ? data.activo : true,
    };
    mockTransactionTypes.push(newTransactionType);
    return Promise.resolve({ ...newTransactionType });
  },

  // Actualizar un tipo de transacción existente
  update: async (id: number, data: UpdateTransactionTypeDto): Promise<TransactionType> => {
    const index = mockTransactionTypes.findIndex(type => type.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Tipo de transacción con ID ${id} no encontrado`));
    }
    
    mockTransactionTypes[index] = {
      ...mockTransactionTypes[index],
      ...data,
    };
    
    return Promise.resolve({ ...mockTransactionTypes[index] });
  },

  // Eliminar un tipo de transacción
  delete: async (id: number): Promise<void> => {
    const index = mockTransactionTypes.findIndex(type => type.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Tipo de transacción con ID ${id} no encontrado`));
    }
    
    mockTransactionTypes.splice(index, 1);
    return Promise.resolve();
  },

  // Cambiar el estado de un tipo de transacción
  toggleStatus: async (id: number): Promise<TransactionType> => {
    const index = mockTransactionTypes.findIndex(type => type.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Tipo de transacción con ID ${id} no encontrado`));
    }
    
    mockTransactionTypes[index].activo = !mockTransactionTypes[index].activo;
    return Promise.resolve({ ...mockTransactionTypes[index] });
  }
};

export default transactionTypesMockApi;
