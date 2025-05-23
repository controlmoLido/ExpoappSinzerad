import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

interface User {
  id: number;
  nom: string;
  email?: string;
}

interface AuthContextProps {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children?: ReactNode;  // children is optional but usually present
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => setUser(userData), []);
  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return React.createElement(AuthContext.Provider, { value }, props.children);
};

// Custom hook to consume AuthContext
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
