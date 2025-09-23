import { useState, useCallback } from 'react';
import claimService from '../services/claimService';
import { useClaimValidation } from './useClaimValidation';

/**
 * Custom hook for claim actions (forward, return, etc.)
 */
export const useClaimActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { validateForwardForm, validateReturnForm } = useClaimValidation();

  /**
   * Forwards claim to insurer
   */
  const forwardToInsurer = useCallback(async (claimId, data, claim) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate data before submission
      const validation = validateForwardForm(data, claim);
      if (!validation.isValid) {
        throw new Error('Validation failed');
      }

      const response = await claimService.forwardToInsurer(claimId, data);
      
      setSuccess('Claim forwarded to insurer successfully');
      return response;
    } catch (err) {
      console.error('Error forwarding claim:', err);
      setError(err.message || 'Failed to forward claim to insurer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateForwardForm]);

  /**
   * Returns claim to previous stage
   */
  const returnClaim = useCallback(async (claimId, returnReason, claim, userRole) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate return eligibility
      const validation = validateReturnForm(claim, userRole);
      if (!validation.isValid) {
        throw new Error('Cannot return claim from current stage');
      }

      const response = await claimService.returnClaim(claimId, returnReason);
      
      setSuccess('Claim returned successfully');
      return response;
    } catch (err) {
      console.error('Error returning claim:', err);
      setError(err.message || 'Failed to return claim');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateReturnForm]);

  /**
   * Makes final decision on claim (insurance agent only)
   */
  const makeDecision = useCallback(async (claimId, decision) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation
      if (!decision.status || !['approved', 'rejected'].includes(decision.status)) {
        throw new Error('Invalid decision status');
      }

      if (decision.status === 'approved' && (!decision.approvedAmount || decision.approvedAmount <= 0)) {
        throw new Error('Approved amount is required for approved claims');
      }

      if (decision.status === 'rejected' && !decision.rejectionReason) {
        throw new Error('Rejection reason is required for rejected claims');
      }

      const response = await claimService.makeDecision(claimId, decision);
      
      setSuccess(`Claim ${decision.status} successfully`);
      return response;
    } catch (err) {
      console.error('Error making claim decision:', err);
      setError(err.message || 'Failed to make claim decision');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Downloads claim document
   */
  const downloadDocument = useCallback(async (claimId, documentId, filename) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await claimService.downloadClaimDocument(claimId, documentId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Document downloaded successfully');
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err.message || 'Failed to download document');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Bulk operations on multiple claims
   */
  const performBulkOperation = useCallback(async (operation, claimIds, data = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!claimIds || claimIds.length === 0) {
        throw new Error('No claims selected for bulk operation');
      }

      const response = await claimService.bulkOperation(operation, claimIds, data);
      
      setSuccess(`Bulk ${operation} completed successfully for ${claimIds.length} claims`);
      return response;
    } catch (err) {
      console.error('Error performing bulk operation:', err);
      setError(err.message || 'Bulk operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exports claims data
   */
  const exportClaims = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await claimService.exportClaims(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `claims_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Claims exported successfully');
    } catch (err) {
      console.error('Error exporting claims:', err);
      setError(err.message || 'Failed to export claims');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clears success/error messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  /**
   * Generic action handler with loading states
   */
  const executeAction = useCallback(async (actionFn, successMessage = null) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await actionFn();
      if (successMessage) {
        setSuccess(successMessage);
      }
      return result;
    } catch (err) {
      setError(err.message || 'Action failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    success,
    
    // Actions
    forwardToInsurer,
    returnClaim,
    makeDecision,
    downloadDocument,
    performBulkOperation,
    exportClaims,
    executeAction,
    
    // Utilities
    clearMessages,
    
    // Computed
    hasError: !!error,
    hasSuccess: !!success,
    isIdle: !loading && !error && !success
  };
};

/**
 * Custom hook for managing modal states and actions
 */
export const useClaimModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'forward', 'return', 'decision', etc.
    claimId: null,
    claim: null,
    data: null
  });

  const openModal = useCallback((type, claimId, claim = null, data = null) => {
    setModalState({
      isOpen: true,
      type,
      claimId,
      claim,
      data
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      claimId: null,
      claim: null,
      data: null
    });
  }, []);

  const updateModalData = useCallback((data) => {
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, ...data }
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    updateModalData,
    isOpen: modalState.isOpen,
    modalType: modalState.type,
    selectedClaim: modalState.claim,
    selectedClaimId: modalState.claimId
  };
};

/**
 * Custom hook for managing selected claims (for bulk operations)
 */
export const useClaimSelection = () => {
  const [selectedClaims, setSelectedClaims] = useState(new Set());

  const selectClaim = useCallback((claimId) => {
    setSelectedClaims(prev => new Set(prev.add(claimId)));
  }, []);

  const deselectClaim = useCallback((claimId) => {
    setSelectedClaims(prev => {
      const newSet = new Set(prev);
      newSet.delete(claimId);
      return newSet;
    });
  }, []);

  const toggleClaim = useCallback((claimId) => {
    setSelectedClaims(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((claimIds) => {
    setSelectedClaims(new Set(claimIds));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedClaims(new Set());
  }, []);

  const isSelected = useCallback((claimId) => {
    return selectedClaims.has(claimId);
  }, [selectedClaims]);

  return {
    selectedClaims: Array.from(selectedClaims),
    selectedClaimIds: selectedClaims,
    selectClaim,
    deselectClaim,
    toggleClaim,
    selectAll,
    deselectAll,
    isSelected,
    hasSelected: selectedClaims.size > 0,
    selectedCount: selectedClaims.size
  };
};