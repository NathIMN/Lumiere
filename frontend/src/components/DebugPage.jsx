import React from 'react';

const DebugPage = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  
  const testApiCall = async () => {
    try {
      console.log('Testing API call to:', apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/users`);
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
    } catch (error) {
      console.error('API call failed:', error);
      alert(`API call failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Debug Information</h2>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Environment Variables:</strong><br/>
        VITE_API_BASE_URL: {apiBaseUrl || 'NOT SET'}<br/>
        VITE_SOCKET_URL: {socketUrl || 'NOT SET'}<br/>
      </div>
      
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Current Location:</strong><br/>
        {window.location.href}
      </div>
      
      <button 
        onClick={testApiCall}
        style={{ 
          background: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test API Call
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <strong>Instructions:</strong><br/>
        1. Open browser console (F12)<br/>
        2. Click "Test API Call" button<br/>
        3. Check console for network request details<br/>
      </div>
    </div>
  );
};

export default DebugPage;