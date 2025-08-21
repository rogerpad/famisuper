import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { PaymentDocument, CreatePaymentDocumentDto, UpdatePaymentDocumentDto } from './types';

// API endpoints
const PAYMENT_DOCUMENTS_ENDPOINT = '/payment-documents';

// API functions
export const fetchPaymentDocuments = async (): Promise<PaymentDocument[]> => {
  const response = await api.get(PAYMENT_DOCUMENTS_ENDPOINT);
  return response.data;
};

export const fetchActivePaymentDocuments = async (): Promise<PaymentDocument[]> => {
  const response = await api.get(`${PAYMENT_DOCUMENTS_ENDPOINT}/active`);
  return response.data;
};

export const fetchPaymentDocumentById = async (id: number): Promise<PaymentDocument> => {
  const response = await api.get(`${PAYMENT_DOCUMENTS_ENDPOINT}/${id}`);
  return response.data;
};

export const createPaymentDocument = async (data: CreatePaymentDocumentDto): Promise<PaymentDocument> => {
  const response = await api.post(PAYMENT_DOCUMENTS_ENDPOINT, data);
  return response.data;
};

export const updatePaymentDocument = async ({
  id,
  data,
}: {
  id: number;
  data: UpdatePaymentDocumentDto;
}): Promise<PaymentDocument> => {
  const response = await api.put(`${PAYMENT_DOCUMENTS_ENDPOINT}/${id}`, data);
  return response.data;
};

export const deletePaymentDocument = async (id: number): Promise<void> => {
  await api.delete(`${PAYMENT_DOCUMENTS_ENDPOINT}/${id}`);
};

export const togglePaymentDocumentStatus = async (id: number): Promise<PaymentDocument> => {
  const response = await api.patch(`${PAYMENT_DOCUMENTS_ENDPOINT}/${id}/toggle-status`);
  return response.data;
};

// Custom hook for payment documents management
export const usePaymentDocuments = () => {
  const queryClient = useQueryClient();
  const [selectedPaymentDocument, setSelectedPaymentDocument] = useState<PaymentDocument | null>(null);

  // Queries
  const {
    data: paymentDocuments,
    isLoading: isLoadingPaymentDocuments,
    error: paymentDocumentsError,
    refetch: refetchPaymentDocuments,
  } = useQuery(['paymentDocuments'], fetchPaymentDocuments);

  const {
    data: activePaymentDocuments,
    isLoading: isLoadingActivePaymentDocuments,
    error: activePaymentDocumentsError,
    refetch: refetchActivePaymentDocuments,
  } = useQuery(['activePaymentDocuments'], fetchActivePaymentDocuments);

  // Mutations
  const createMutation = useMutation(createPaymentDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentDocuments']);
      queryClient.invalidateQueries(['activePaymentDocuments']);
    },
  });

  const updateMutation = useMutation(updatePaymentDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentDocuments']);
      queryClient.invalidateQueries(['activePaymentDocuments']);
    },
  });

  const deleteMutation = useMutation(deletePaymentDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentDocuments']);
      queryClient.invalidateQueries(['activePaymentDocuments']);
    },
  });

  const toggleStatusMutation = useMutation(togglePaymentDocumentStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentDocuments']);
      queryClient.invalidateQueries(['activePaymentDocuments']);
    },
  });

  // Helper functions
  const handleCreate = useCallback(
    async (data: CreatePaymentDocumentDto) => {
      try {
        await createMutation.mutateAsync(data);
        return { success: true };
      } catch (error) {
        console.error('Error creating payment document:', error);
        return { success: false, error };
      }
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    async (id: number, data: UpdatePaymentDocumentDto) => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return { success: true };
      } catch (error) {
        console.error('Error updating payment document:', error);
        return { success: false, error };
      }
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting payment document:', error);
        return { success: false, error };
      }
    },
    [deleteMutation]
  );

  const handleToggleStatus = useCallback(
    async (id: number) => {
      try {
        await toggleStatusMutation.mutateAsync(id);
        return { success: true };
      } catch (error) {
        console.error('Error toggling payment document status:', error);
        return { success: false, error };
      }
    },
    [toggleStatusMutation]
  );

  return {
    // Data
    paymentDocuments,
    activePaymentDocuments,
    selectedPaymentDocument,
    
    // Loading states
    isLoadingPaymentDocuments,
    isLoadingActivePaymentDocuments,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isTogglingStatus: toggleStatusMutation.isLoading,
    
    // Errors
    paymentDocumentsError,
    activePaymentDocumentsError,
    
    // Actions
    setSelectedPaymentDocument,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
    refetchPaymentDocuments,
    refetchActivePaymentDocuments,
  };
};
