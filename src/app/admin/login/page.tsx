'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Lock, Mail, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/db';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuth() {
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase!.auth.getUser();
        if (user) {
          router.push('/admin/dashboard');
        }
      } else {
        const mockSession = localStorage.getItem('wedding_mock_admin_session');
        if (mockSession) {
          router.push('/admin/dashboard');
        }
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (!isSupabaseConfigured) {
        // Fallback mock authentication
        if (email === 'admin@wedding.com' && password === 'admin123') {
          localStorage.setItem('wedding_mock_admin_session', 'true');
          router.push('/admin/dashboard');
        } else {
          setErrorMsg('Invalid email or password. Use admin@wedding.com / admin123 for local demo.');
        }
      } else {
        // Real Supabase Authentication
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push('/admin/dashboard');
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(250, 246, 240, 0.9), rgba(243, 236, 216, 0.85)), url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=80')`
      }}
    >
      {/* Back to Home Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-serif font-bold text-gold-600 hover:text-gold-700 transition-colors bg-white/60 hover:bg-white px-4 py-2 rounded-full border border-gold-200/20 backdrop-blur-md shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back To Invitation
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card max-w-md w-full p-8 sm:p-10 rounded-[35px] border border-white shadow-2xl relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center text-gold-500 border border-gold-200/20 shadow-inner">
            <Heart className="w-6 h-6 fill-gold-400/10" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-widest text-[#2D2D2D] mb-2 uppercase">
          Wedding Portal
        </h1>
        <p className="text-xs font-sans text-[#5A5A5A] mb-8 uppercase tracking-widest">
          Admin Dashboard Login
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-3 text-left rounded-xl bg-gold-100/50 border border-gold-200/30 text-gold-800 text-[11px] font-sans">
            <p className="font-bold mb-1">Demo Mode Active:</p>
            <p>Supabase is not configured yet. Sign in using:</p>
            <p className="mt-1 font-mono">Email: <span className="font-bold">admin@wedding.com</span></p>
            <p className="font-mono">Password: <span className="font-bold">admin123</span></p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-serif font-semibold tracking-widest hover:from-gold-600 hover:to-gold-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer disabled:opacity-50 transition-all uppercase text-xs"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
