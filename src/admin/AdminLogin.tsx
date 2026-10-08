import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, User, Sparkles } from 'lucide-react';
import { useAdmin, AdminUser } from '../context/AdminContext';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToWebsite }) => {
  const { login } = useAdmin();
  const [email, setEmail] = useState('raimanish200822@gmail.com');
  const [password, setPassword] = useState('7860');
  const [role, setRole] = useState<AdminUser['role']>('Super Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // If password is master PIN 7860, instant login
    if (password === '7860') {
      login({
        email: email || 'admin@shivanigraphics.com',
        name: 'Ranjan Roy',
        role: 'Super Admin'
      });
      setLoading(false);
      return;
    }

    // Otherwise try Firebase Authentication
    try {
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr) {
        // If not registered, create user automatically for convenience
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      }

      login({
        email: userCred.user.email || email,
        name: userCred.user.email?.split('@')[0].toUpperCase() || 'ADMIN',
        role
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. You can use master PIN 7860 for instant access.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPasscode = () => {
    login({
      email: 'raimanish200822@gmail.com',
      name: 'Ranjan Roy',
      role: 'Super Admin'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-[#50007c] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#50007c] to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shivani Graphics</h1>
          <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Firebase Cloud & Master Admin Studio</p>
        </div>

        {/* Quick Access Notice */}
        <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-2xl space-y-1 text-center">
          <p className="font-black flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Instant Admin Access:
          </p>
          <p className="text-purple-700 text-[11px]">
            Master Passcode PIN is set to <strong className="font-mono bg-purple-200 px-1.5 py-0.5 rounded text-purple-950">7860</strong>. Click below to enter instantly!
          </p>
          <button
            type="button"
            onClick={handleQuickPasscode}
            className="mt-2 px-4 py-2 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            ⚡ Enter with Master PIN (7860)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Firebase / Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#50007c] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password or Master PIN (7860)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="7860"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#50007c] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#50007c] font-medium bg-white"
              >
                <option value="Super Admin">Super Admin (Full Access)</option>
                <option value="Manager">Manager (Orders & Products)</option>
                <option value="Staff">Staff (Order Fulfillment)</option>
                <option value="Designer">Designer (Prepress & Files)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#50007c] to-purple-800 hover:from-purple-900 hover:to-purple-950 text-white font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Connecting to Firebase...' : 'Login with Firebase & PIN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            ← Return to Shivani Graphics Public Website
          </button>
        </div>

      </div>
    </div>
  );
};
