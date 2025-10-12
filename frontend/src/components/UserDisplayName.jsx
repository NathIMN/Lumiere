import React, { useState, useEffect } from 'react';
import userApiService from '../services/user-api';

const UserDisplayName = ({ userId, className = '', userCache = null }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || userId === 'Unknown User ID') {
        setUserData(null);
        setLoading(false);
        return;
      }

      // Check if user data is available in cache first
      if (userCache && userCache.has(userId)) {
        const cachedUser = userCache.get(userId);
        setUserData({ user: cachedUser }); // Wrap in the expected format
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user data by ID
        const user = await userApiService.getUserById(userId);
        setUserData(user);
      } catch (err) {
        console.warn(`Failed to fetch user data for ID ${userId}:`, err.message);
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, userCache]);

  // Loading state
  if (loading) {
    return (
      <span className={`text-gray-500 italic ${className}`}>
        Loading...
      </span>
    );
  }

  // Error state or no user found
  if (error || !userData) {
    // For 404 errors (user not found), show a more user-friendly message
    const isUserNotFound = error && error.includes('404') || error === 'API request failed';
    
    return (
      <span className={`text-gray-500 ${className}`} title={`User ID: ${userId}`}>
        {userId === 'Unknown User ID' ? 'Unknown User' : 
         isUserNotFound ? 'Deleted User' : 
         'Unknown User'}
      </span>
    );
  }

  // Extract name from user data
  const getDisplayName = () => {
    // The API returns { success: true, user: {...} }, so we need to access the user property
    const user = userData.user || userData;
    
    const { profile } = user;
    
    if (!profile) {
      return user.fullName || user.name || 'Unknown User';
    }

    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return user.fullName || user.name || 'Unknown User';
  };

  return (
    <span className={className} title={`User ID: ${userId}`}>
      {getDisplayName()}
    </span>
  );
};

export default UserDisplayName;