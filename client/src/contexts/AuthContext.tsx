import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Updated User interface to match the actual server response
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely parse localStorage data
const safeParseJSON = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    
    // Check for invalid values
    if (!data || data === "undefined" || data === "null") {
      localStorage.removeItem(key);
      return null;
    }
    
    // Try to parse JSON
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    localStorage.removeItem(key);
    return null;
  }
};

// Helper function to safely store data in localStorage
const safeSetItem = (key: string, value: any): void => {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Error storing item "${key}" in localStorage:`, error);
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up any invalid localStorage data on app start
    const cleanupLocalStorage = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        // Clean up token
        if (storedToken === "undefined" || storedToken === "null" || storedToken === null) {
          localStorage.removeItem('authToken');
        }
        
        // Clean up user data
        if (storedUser === "undefined" || storedUser === "null" || storedUser === null) {
          localStorage.removeItem('user');
        } else {
          try {
            JSON.parse(storedUser);
          } catch (parseError) {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error during localStorage cleanup:', error);
      }
    };
    
    cleanupLocalStorage();
    
    // Check if user is already logged in
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Check if storedUser is a valid JSON string and not "undefined" or null
        if (storedUser === "undefined" || storedUser === "null" || storedUser === null || storedUser === undefined) {
          throw new Error('Stored user data is invalid (undefined/null)');
        }
        
        // Try to parse the user data
        const userData = JSON.parse(storedUser);
        
        // Validate that we have a proper user object
        if (!userData || typeof userData !== 'object') {
          throw new Error('Stored user data is not a valid object');
        }
        
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    // Validate user data before storing
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data provided to login function');
      return;
    }
    
    setToken(newToken);
    setUser(userData);
    safeSetItem('authToken', newToken);
    safeSetItem('user', userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-300">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};