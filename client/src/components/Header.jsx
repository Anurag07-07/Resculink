import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Globe, Shield } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="clean-panel border-b border-brand-border p-4 flex justify-between items-center z-50 relative">
      <Link to="/" className="flex items-center gap-3 text-xl font-bold group">
        <Globe className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
        <span>Rescue<span className="font-light">Link</span></span>
      </Link>

      <nav>
        {user ? (
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm font-medium bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 px-3 py-1.5 rounded-lg border border-emerald-600/30 transition"
                >
                  <Shield size={14} />
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-muted border border-brand-border px-3 py-1 rounded">
              <Shield size={12} />
              {user.role}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-[10px] text-brand-muted font-mono">ID: {user._id?.slice(-6) || 'N/A'}</div>
              </div>
              <button onClick={logout} className="p-2 hover:bg-brand-card rounded transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <Link to="/" className="text-brand-muted hover:text-white font-medium text-sm transition">Login / Register</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
