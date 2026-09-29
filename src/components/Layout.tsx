import { useState, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Download, LogIn, Settings, Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const auth = useContext(AuthContext);

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/download', icon: <Download size={20} />, label: 'Download' },
    { to: '/login', icon: <LogIn size={20} />, label: 'Login' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const sidebar = (
    <div className="flex flex-col h-full bg-[#111122] border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#fb7299] to-purple-500 bg-clip-text text-transparent">
            BBDown
          </h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-[#fb7299] text-white rounded-full">Web</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">Bilibili Downloader</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#fb7299] text-white shadow-[0_0_15px_rgba(251,114,153,0.3)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Proxy</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-green-500">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Account</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${auth.isLoggedIn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={auth.isLoggedIn ? 'text-green-500' : 'text-gray-500'}>
                {auth.isLoggedIn ? (auth.username || 'Logged in') : 'Not logged in'}
              </span>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 mt-2">
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a1a] text-[#e5e5e5]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 glass z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold capitalize hidden sm:block">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end max-w-md">
            <div className="relative w-full max-w-xs hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Paste Bilibili URL..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#fb7299] focus:ring-1 focus:ring-[#fb7299] transition-all"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fb7299] to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#111122] flex items-center justify-center">
                <LogIn size={14} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
