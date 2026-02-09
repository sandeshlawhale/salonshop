import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('SALON_OWNER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: userType,
      });

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'AGENT') {
        navigate('/agent-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 px-4 py-20">
      <div className="w-full max-w-2xl p-10 bg-white rounded-[48px] shadow-2xl shadow-neutral-900/5 border border-neutral-100 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 border border-emerald-100">
              <Sparkles size={12} />
              Professional Access
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-none mb-4">
              Join the <span className="text-emerald-600">Circle.</span>
            </h1>
            <p className="text-neutral-500 font-bold text-sm">Register your professional credentials to begin.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">First Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Last Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Email Endpoint</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="email"
                    placeholder="pro@salon.com"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Comms Protocol (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Keyphrase</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Verify Keyphrase</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm pl-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl animate-in fade-in slide-in-from-top-1 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="group w-full h-16 bg-neutral-900 hover:bg-emerald-600 text-white font-black rounded-[24px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-2xl shadow-neutral-900/20 hover:shadow-emerald-600/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  INITIALIZE ACCOUNT
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">
                Existing Member?
                <button
                  type="button"
                  className="ml-2 font-black text-neutral-900 underline underline-offset-4 hover:text-emerald-600 transition-colors"
                  onClick={() => navigate('/login')}
                >
                  AUTHENTICATE
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
