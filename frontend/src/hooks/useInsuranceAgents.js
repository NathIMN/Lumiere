import { useState, useCallback } from 'react';
import { userService } from '../services/userService';

export const useInsuranceAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all insurance agents
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Assuming you have a user service that can filter by role
      const response = await userService.getUsersByRole('insurance_agent');
      
      if (response.success) {
        setAgents(response.users || []);
      } else {
        throw new Error(response.message || 'Failed to fetch insurance agents');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching insurance agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch agent details by ID
  const fetchAgentById = useCallback(async (agentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserById(agentId);
      
      if (response.success && response.user.role === 'insurance_agent') {
        return response.user;
      } else {
        throw new Error('Agent not found or invalid role');
      }
    } catch (err) {
      const errorMessage = 'Failed to load agent details';
      setError(errorMessage);
      console.error('Error fetching agent by ID:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setAgents([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // State
    agents,
    loading,
    error,
    
    // Actions
    fetchAgents,
    fetchAgentById,
    resetState
  };
};