import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = (role) => {
    setRoleTab(role);
    if (role === 'citizen') {
      setEmail('citizen@urbanpulse.io');
      setPassword('password123');
    } else if (role === 'authority') {
      setEmail('authority@urbanpulse.io');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@urbanpulse.io');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'authority') navigate('/authority');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#00F2FE] p-0.5 shadow-glow-sm mb-2">
            <div className="w-full h-full bg-[#0B132B] rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#00F2FE]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In to UrbanPulse
          </h2>
          <p className="text-xs text-slate-400">
            Access citizen reporting, department dispatch, or city command suite
          </p>
        </div>

        {/* Demo One-Click Selectors */}
        <div className="glass-panel p-3 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 mb-2">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Credentials</span>
            </span>
            <span className="text-slate-500">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('citizen')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                roleTab === 'citizen'
                  ? 'bg-[#0284C7]/20 border-[#00F2FE] text-[#00F2FE]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('authority')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                roleTab === 'authority'
                  ? 'bg-[#0284C7]/20 border-[#00F2FE] text-[#00F2FE]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Authority
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                roleTab === 'admin'
                  ? 'bg-[#0284C7]/20 border-[#00F2FE] text-[#00F2FE]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/80 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@urbanpulse.io"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <span className="text-[11px] text-slate-500 font-mono">Demo: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00F2FE] text-slate-950 font-bold text-sm shadow-glow-sm hover:brightness-110 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Don't have an account yet? </span>
            <Link to="/register" className="text-xs font-semibold text-[#00F2FE] hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
