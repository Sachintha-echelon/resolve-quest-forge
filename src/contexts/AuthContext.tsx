import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api/users';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (fullname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading: boolean;
  fetchAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
  };

  const login = async (email: string, password: string) => {
    const data = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (fullname: string, email: string, password: string) => {
    const data = await apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify({ fullname, email, password }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const data = await apiCall(`/profile?email=${encodeURIComponent(user.email)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    const updatedUser = data.user;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) throw new Error('User not found');

    const data = await apiCall(`/profile?email=${encodeURIComponent(targetUser.email)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    const updatedUser = data.user;
    setUsers(users.map(u => (u.id === id ? updatedUser : u)));
    if (user?.id === id) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) throw new Error('User not found');

    await apiCall(`/profile?email=${encodeURIComponent(targetUser.email)}`, {
      method: 'DELETE',
    });

    setUsers(users.filter(u => u.id !== id));
    if (user?.id === id) {
      logout();
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    await apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    await fetchAllUsers();
  };

  const fetchAllUsers = async () => {
    try {
      const data = await apiCall('/profiles');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        signup,
        logout,
        updateProfile,
        updateUser,
        deleteUser,
        createUser,
        isLoading,
        fetchAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}