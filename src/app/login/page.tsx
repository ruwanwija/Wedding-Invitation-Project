'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Heart, Mail, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to request login code.');
      }

      // Success, redirect to verify-otp page with flow=login
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&flow=login`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(250, 246, 240, 0.9), rgba(243, 236, 216, 0.85)), url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=80')`,
      }}
    >
      {/* Back to Invitation */}
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

        <div className="mb-6 p-4 text-left rounded-xl bg-gold-50 border border-gold-200/20 text-[#5A5A5A] text-[11px] font-sans">
          <p className="font-bold text-gold-700 mb-1">Passwordless Sign In:</p>
          <p>Enter your registered administrator email to receive a 6-digit verification code.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="login-email"
                type="email"
                {...register('email')}
                placeholder="admin@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600 font-sans font-medium">{errors.email.message}</p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-serif font-semibold tracking-widest hover:from-gold-600 hover:to-gold-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer disabled:opacity-50 transition-all uppercase text-xs mt-6"
          >
            {isLoading ? 'Sending Code...' : 'Send Login Code'}
          </button>
        </form>

        <p className="mt-6 text-xs text-[#5A5A5A] font-sans">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-gold-600 hover:text-gold-700 font-bold hover:underline cursor-pointer"
          >
            Register here
          </button>
        </p>
      </motion.div>
    </div>
  );
}
