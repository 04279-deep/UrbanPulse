import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  MapPin,
  AlertTriangle,
  BarChart3,
  Shield,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { notificationService } from '../services/api';

const Navbar = () => {
  const { user, logout, switchDemoRole, notifications, unreadCount, refreshNotifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      refreshNotifications();
    } catch (e) {
      console.warn(e);
    }
  };

  const navLinks = [
    { name: 'Live Map', path: '/map', icon: MapPin },
    { name: 'Report Incident', path: '/report', icon: AlertTriangle, highlight: true },
    { name: 'City Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Track Issue', path: '/track', icon: Search },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'authority') return '/authority';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5 shadow-glow-sm group-hover:shadow-glow transition-all">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00F2FE] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Urban<span className="text-[#00F2FE]">Pulse</span>
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Smart Infra AI v2.0
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    link.highlight
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-900 font-semibold shadow-glow-sm hover:brightness-110 hover:shadow-glow'
                      : isActive
                      ? 'bg-slate-800 text-[#00F2FE] border border-[#00F2FE]/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-slate-900' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user && (
              <Link
                to={getDashboardPath()}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === getDashboardPath()
                    ? 'bg-slate-800 text-[#00F2FE] border border-[#00F2FE]/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4 text-[#00F2FE]" />
                <span>
                  {user.role === 'admin'
                    ? 'Admin Suite'
                    : user.role === 'authority'
                    ? 'Authority Hub'
                    : 'My Dashboard'}
                </span>
              </Link>
            )}
          </div>

          {/* Right Action Icons: Demo switcher, Notifications, Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Demo Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                title="Switch Demo Roles"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Role: {user ? user.role : 'Demo'}</span>
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('citizen');
                      setDemoMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/60 flex items-center justify-between"
                  >
                    <span>Citizen (Aiden Reed)</span>
                    {user?.role === 'citizen' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('authority');
                      setDemoMenuOpen(false);
                      navigate('/authority');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/60 flex items-center justify-between"
                  >
                    <span>Authority (Vance - Roads)</span>
                    {user?.role === 'authority' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setDemoMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/60 flex items-center justify-between"
                  >
                    <span>Admin (Chief Reynolds)</span>
                    {user?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Alerts & Notifications</span>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#00F2FE] hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-2.5 text-xs hover:bg-slate-800/60 transition-colors ${
                              !n.isRead ? 'bg-slate-800/40 border-l-2 border-[#00F2FE]' : ''
                            }`}
                          >
                            <div className="font-semibold text-slate-200">{n.title}</div>
                            <div className="text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] flex items-center justify-center text-slate-900 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-[#00F2FE] font-mono">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 shadow-glow-sm hover:shadow-glow transition-all"
                >
                  Join Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#00F2FE] hover:bg-slate-800"
            >
              Dashboard ({user.role})
            </Link>
          )}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 font-semibold"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-[#00F2FE] font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
