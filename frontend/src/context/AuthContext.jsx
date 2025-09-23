import { createContext, useContext, useReducer, useEffect } from 'react';

// Get API URL with fallback
const getApiUrl = () => {
  return window.REACT_APP_API_URL || 'http://localhost:5000';
};

// Development mode check
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || !window.REACT_APP_API_URL;
};

// Mock users for development
const MOCK_USERS = {
  'admin@lumiere.com': { 
    id: 1, 
    email: 'admin@lumiere.com', 
    role: 'admin', 
    name: 'Admin User',
    department: 'Management' 
  },
  'hr@lumiere.com': { 
    id: 2, 
    email: 'hr@lumiere.com', 
    role: 'hr_officer', 
    name: 'HR Officer',
    department: 'Human Resources' 
  },
  'employee@lumiere.com': { 
    id: 3, 
    email: 'employee@lumiere.com', 
    role: 'employee', 
    name: 'Employee User',
    department: 'Operations' 
  },
  'agent@lumiere.com': { 
    id: 4, 
    email: 'agent@lumiere.com', 
    role: 'insurance_agent', 
    name: 'Insurance Agent',
    department: 'Sales' 
  }
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer (keep your existing reducer - it's perfect)
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          if (isDevelopmentMode()) {
            // Development mode: check if token matches mock user
            const mockUser = Object.values(MOCK_USERS).find(user => 
              btoa(user.email) === token
            );
            
            if (mockUser) {
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: mockUser,
                  token,
                },
              });
            } else {
              localStorage.removeItem('authToken');
              dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
          } else {
            // Production mode: validate with server
            const response = await fetch(`${getApiUrl()}/api/v1/users/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: data.user,
                  token,
                },
              });
            } else {
              localStorage.removeItem('authToken');
              dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      if (isDevelopmentMode()) {
        // Development mode: use mock authentication
        console.log('🚀 Development Mode: Using mock authentication');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = MOCK_USERS[email];
        
        if (user && password === 'password123') {
          const mockToken = btoa(email); // Simple token for development
          
          localStorage.setItem('authToken', mockToken);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: user,
              token: mockToken,
            },
          });

          console.log('✅ Mock login successful for:', user.role);
          return { success: true, user: user };
        } else {
          const errorMessage = 'Invalid credentials. Use: password123';
          dispatch({
            type: AUTH_ACTIONS.LOGIN_ERROR,
            payload: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      } else {
        // Production mode: use real API
        console.log('🌐 Production Mode: Attempting login to:', `${getApiUrl()}/api/v1/users/login`);
        
        const response = await fetch(`${getApiUrl()}/api/v1/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        console.log('Response status:', response.status);

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON response');
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok && data.success) {
          localStorage.setItem('authToken', data.token);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: data.user,
              token: data.token,
            },
          });

          return { success: true, user: data.user };
        } else {
          const errorMessage = data.message || 'Login failed';
          dispatch({
            type: AUTH_ACTIONS.LOGIN_ERROR,
            payload: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Using development mode instead.';
        console.log('🔄 Switching to development mode due to connection error');
        // Retry in development mode
        return await login(email, password);
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Server returned invalid response. Please check server logs.';
      } else {
        errorMessage = `Network error: ${error.message}. Please check your connection and try again.`;
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function (keep your existing - it's perfect)
  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function (keep your existing - it's perfect)
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Keep all your existing utility functions - they're excellent
  const getUserRole = () => {
    return state.user?.role || null;
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    getUserRole,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook (keep your existing - it's perfect)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
