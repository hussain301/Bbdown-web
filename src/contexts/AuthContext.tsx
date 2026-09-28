import { createContext, useState, useEffect, ReactNode } from 'react';

export interface AuthState {
  cookie: string;
  accessToken: string;
  isLoggedIn: boolean;
  loginType: 'none' | 'web' | 'tv' | 'manual';
  username: string;
  vipStatus: string;
}

export interface AuthContextType extends AuthState {
  setCookie: (cookie: string) => void;
  setAccessToken: (token: string) => void;
  setManualCredentials: (cookie: string, token: string) => void;
  logout: () => void;
  checkLoginStatus: () => Promise<void>;
}

const defaultState: AuthState = {
  cookie: '',
  accessToken: '',
  isLoggedIn: false,
  loginType: 'none',
  username: '',
  vipStatus: '',
};

export const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  setCookie: () => {},
  setAccessToken: () => {},
  setManualCredentials: () => {},
  logout: () => {},
  checkLoginStatus: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCookie = localStorage.getItem('bbdown_cookie') || '';
    const savedToken = localStorage.getItem('bbdown_access_token') || '';
    const savedLoginType = (localStorage.getItem('bbdown_login_type') as AuthState['loginType']) || 'none';
    const savedUsername = localStorage.getItem('bbdown_username') || '';
    const savedVipStatus = localStorage.getItem('bbdown_vip_status') || '';

    const isLoggedIn = !!savedCookie || !!savedToken;

    setAuthState({
      cookie: savedCookie,
      accessToken: savedToken,
      isLoggedIn,
      loginType: isLoggedIn ? savedLoginType : 'none',
      username: savedUsername,
      vipStatus: savedVipStatus,
    });
  }, []);

  const saveToStorage = (state: Partial<AuthState>) => {
    if (state.cookie !== undefined) localStorage.setItem('bbdown_cookie', state.cookie);
    if (state.accessToken !== undefined) localStorage.setItem('bbdown_access_token', state.accessToken);
    if (state.loginType !== undefined) localStorage.setItem('bbdown_login_type', state.loginType);
    if (state.username !== undefined) localStorage.setItem('bbdown_username', state.username);
    if (state.vipStatus !== undefined) localStorage.setItem('bbdown_vip_status', state.vipStatus);
  };

  const setCookie = (cookie: string) => {
    const newState: AuthState = {
      ...authState,
      cookie,
      isLoggedIn: true,
      loginType: 'web',
      username: 'User (Cookie)',
      vipStatus: 'Unknown',
    };
    setAuthState(newState);
    saveToStorage(newState);
  };

  const setAccessToken = (token: string) => {
    const newState: AuthState = {
      ...authState,
      accessToken: token,
      isLoggedIn: true,
      loginType: 'tv',
      username: 'User (Token)',
      vipStatus: 'Unknown',
    };
    setAuthState(newState);
    saveToStorage(newState);
  };

  const setManualCredentials = (cookie: string, token: string) => {
    const newState: AuthState = {
      ...authState,
      cookie,
      accessToken: token,
      isLoggedIn: true,
      loginType: 'manual',
      username: 'User (Manual)',
      vipStatus: 'Unknown',
    };
    setAuthState(newState);
    saveToStorage(newState);
  };

  const logout = () => {
    localStorage.removeItem('bbdown_cookie');
    localStorage.removeItem('bbdown_access_token');
    localStorage.removeItem('bbdown_login_type');
    localStorage.removeItem('bbdown_username');
    localStorage.removeItem('bbdown_vip_status');
    
    setAuthState(defaultState);
  };

  const checkLoginStatus = async () => {
    // In a real app, we might call an API to verify the cookie/token.
    // For now, we'll just check if they exist in state.
    if (authState.cookie || authState.accessToken) {
      setAuthState(prev => ({
        ...prev,
        isLoggedIn: true,
        // Mock updating username based on successful check
        username: prev.username || 'Verified User',
        vipStatus: prev.vipStatus || 'Standard',
      }));
    } else {
      setAuthState(prev => ({ ...prev, isLoggedIn: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setCookie,
        setAccessToken,
        setManualCredentials,
        logout,
        checkLoginStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
