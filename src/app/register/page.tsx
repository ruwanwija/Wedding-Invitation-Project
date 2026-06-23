'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Heart, User, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  city: z.string().min(1, 'City is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success, redirect to verify-otp
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&flow=register`);
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
      {/* Back to Login */}
      <button
        onClick={() => router.push('/login')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-serif font-bold text-gold-600 hover:text-gold-700 transition-colors bg-white/60 hover:bg-white px-4 py-2 rounded-full border border-gold-200/20 backdrop-blur-md shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back To Login
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
          Create Admin Account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="reg-name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="reg-name"
                type="text"
                {...register('name')}
                placeholder="Sophia Bennett"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600 font-sans font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="reg-mobile">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="reg-mobile"
                type="text"
                {...register('mobile')}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
            {errors.mobile && (
              <p className="mt-1 text-[11px] text-red-600 font-sans font-medium">{errors.mobile.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="reg-email"
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

          {/* City */}
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5" htmlFor="reg-city">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-500" />
              <input
                id="reg-city"
                type="text"
                {...register('city')}
                placeholder="San Francisco"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
              />
            </div>
            {errors.city && (
              <p className="mt-1 text-[11px] text-red-600 font-sans font-medium">{errors.city.message}</p>
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-[#5A5A5A] font-sans">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-gold-600 hover:text-gold-700 font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
