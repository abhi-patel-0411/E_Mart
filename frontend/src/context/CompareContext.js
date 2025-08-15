import React, { createContext, useContext, useState, useEffect } from 'react';
import { compareAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompareItems();
    } else {
      setCompareItems([]);
    }
  }, [isAuthenticated]);

  const fetchCompareItems = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await compareAPI.get();
      setCompareItems(response.data);
    } catch (error) {
      console.error('Failed to fetch compare items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCompare = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to compare products' };
    }

    try {
      const response = await compareAPI.add(productId);
      await fetchCompareItems(); // Refresh the list
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add to compare' 
      };
    }
  };

  const removeFromCompare = async (productId) => {
    if (!isAuthenticated) return;

    try {
      await compareAPI.remove(productId);
      setCompareItems(compareItems.filter(item => item.product.id !== productId));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove from compare' };
    }
  };

  const clearCompare = async () => {
    if (!isAuthenticated) return;

    try {
      await compareAPI.clear();
      setCompareItems([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to clear compare list' };
    }
  };

  const getCompareItemCount = () => {
    return compareItems.length;
  };

  const isInCompare = (productId) => {
    return compareItems.some(item => item.product.id === productId);
  };

  const value = {
    compareItems,
    loading,
    addToCompare,
    removeFromCompare,
    clearCompare,
    getCompareItemCount,
    isInCompare,
    fetchCompareItems
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};