// src/hooks/usePolicyStats.js
import { useState, useEffect, useCallback } from 'react';
import { policyService } from '../services/policyService';

export const usePolicyStats = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    expiringPolicies: 0,
    typeStats: [],
    statusStats: [],
    categoryStats: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await policyService.getPolicyStats();
      setStats(response.stats || {});
    } catch (err) {
      setError(err.message);
      setStats({
        totalPolicies: 0,
        activePolicies: 0,
        expiringPolicies: 0,
        typeStats: [],
        statusStats: [],
        categoryStats: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};

// Hook for expiring policies
export const useExpiringPolicies = (days = 30) => {
  const [expiringPolicies, setExpiringPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpiringPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await policyService.getExpiringPolicies(days);
      setExpiringPolicies(response.policies || []);
    } catch (err) {
      setError(err.message);
      setExpiringPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchExpiringPolicies();
  }, [fetchExpiringPolicies]);

  return {
    expiringPolicies,
    loading,
    error,
    refresh: fetchExpiringPolicies
  };
};