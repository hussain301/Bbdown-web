import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const showBanner = !isLoggedIn && !isLoginPage && !dismissed;

  return (
    <>
      {showBanner && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-b border-pink-500/30">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-pink-100">
              <ShieldAlert className="w-4 h-4 text-pink-400" />
              <span>
                Login for 1080p+ high-quality downloads and exclusive content access.{' '}
                <Link to="/login" className="text-pink-400 font-medium hover:underline ml-1">
                  Login Now &rarr;
                </Link>
              </span>
            </div>
            <button 
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default AuthGuard;
