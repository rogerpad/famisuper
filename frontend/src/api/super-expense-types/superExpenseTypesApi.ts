import api from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperExpenseType, CreateSuperExpenseTypeDto, UpdateSuperExpenseTypeDto } from './types';

// API de tipos de egresos del super
const superExpenseTypesApi = {
  // Obtener todos los tipos de egresos
  getAll: async (): Promise<SuperExpenseType[]> => {
    const response = await api.get('/super-expense-types');
    return response.data;
  },

  // Obtener solo los tipos de egresos activos
  getAllActive: async (): Promise<SuperExpenseType[]> => {
    const response = await api.get('/super-expense-types/active');
    return response.data;
  },

  // Obtener un tipo de egreso por ID
  getById: async (id: number): Promise<SuperExpenseType> => {
    const response = await api.get(`/super-expense-types/${id}`);
    return response.data;
  },

  // Crear un nuevo tipo de egreso
  create: async (data: CreateSuperExpenseTypeDto): Promise<SuperExpenseType> => {
    const response = await api.post('/super-expense-types', data);
    return response.data;
  },

  // Actualizar un tipo de egreso existente
  update: async (id: number, data: UpdateSuperExpenseTypeDto): Promise<SuperExpenseType> => {
    const response = await api.put(`/super-expense-types/${id}`, data);
    return response.data;
  },

  // Eliminar un tipo de egreso
  delete: async (id: number): Promise<void> => {
    await api.delete(`/super-expense-types/${id}`);
  },

  // Cambiar el estado (activo/inactivo) de un tipo de egreso
  toggleStatus: async (id: number): Promise<SuperExpenseType> => {
    const response = await api.patch(`/super-expense-types/${id}/toggle-status`);
    return response.data;
  }
};

// Hook personalizado para usar los tipos de egresos del super
export const useSuperExpenseTypes = () => {
  const queryClient = useQueryClient();

  // Query para obtener todos los tipos de egresos
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['superExpenseTypes'],
    queryFn: superExpenseTypesApi.getAll
  });

  // Query para obtener solo los tipos de egresos activos
  const { data: activeTypes } = useQuery({
    queryKey: ['superExpenseTypes', 'active'],
    queryFn: superExpenseTypesApi.getAllActive
  });

  // Mutación para crear un nuevo tipo de egreso
  const createMutation = useMutation({
    mutationFn: superExpenseTypesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superExpenseTypes'] });
    }
  });

  // Mutación para actualizar un tipo de egreso
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateSuperExpenseTypeDto }) => 
      superExpenseTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superExpenseTypes'] });
    }
  });

  // Mutación para eliminar un tipo de egreso
  const deleteMutation = useMutation({
    mutationFn: superExpenseTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superExpenseTypes'] });
    }
  });

  // Mutación para cambiar el estado de un tipo de egreso
  const toggleStatusMutation = useMutation({
    mutationFn: superExpenseTypesApi.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superExpenseTypes'] });
    }
  });

  return {
    // Datos
    types: data || [],
    activeTypes: activeTypes || [],
    isLoading,
    isError,
    error,
    refetch,

    // Métodos
    createType: createMutation.mutateAsync,
    updateType: updateMutation.mutateAsync,
    deleteType: deleteMutation.mutateAsync,
    toggleTypeStatus: toggleStatusMutation.mutateAsync
  };
};

export default superExpenseTypesApi;
