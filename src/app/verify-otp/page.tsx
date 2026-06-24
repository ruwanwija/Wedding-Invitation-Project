'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Key, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const flow = searchParams.get('flow') || 'login';

  const otpLength = 8;
  const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Go back if no email
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return; // Only allow numbers

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value.substring(value.length - 1);
      return newOtp;
    });

    // Focus next input if value is entered
    if (value !== '' && index < otpLength - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Focus previous input on backspace if current is empty
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted value is an 8-digit number
    if (/^\d{8}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      setTimeout(() => {
        inputRefs.current[7]?.focus();
      }, 50);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== otpLength) {
      setErrorMsg(`Please enter all ${otpLength} digits.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      setSuccessMsg('Verification Successful! Redirecting...');
      
      // Delay redirect to show the beautiful success checkmark
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = flow === 'register' ? '/api/auth/register' : '/api/auth/login';
      
      // For register we need the details, but since the user details are already saved,
      // the endpoint handles duplicate details (unverified user can re-trigger register)
      // Wait, we need to pass name, mobile, city for register endpoint if it's register flow.
      // But what if we just call '/api/auth/login' for resend?
      // Yes! Since they are saved in admin_users, if they are already in the table, login endpoint works,
      // EXCEPT the login endpoint check is: `if (!user || !user.is_verified) return error`.
      // Ah! The login endpoint blocks unverified users!
      // So if it's the register flow, we must send a request to /api/auth/register but wait,
      // we don't have name, mobile, city in the query parameters.
      // Let's look at register API. It checks:
      // `if (existingUser && existingUser.is_verified) return error`.
      // If the user already exists in admin_users but is NOT verified, we can let them login?
      // Wait! If they are registered but unverified, their email is in `admin_users` but `is_verified` is `false`.
      // If we call `/api/auth/login` for an unverified user, it will return:
      // "Admin email not found. Please register first."
      // To fix this, let's look at our login endpoint check:
      // `if (!user || !user.is_verified) return error;`
      // Ah! Should we allow unverified users to request a login OTP if they are registered?
      // If they registered but didn't verify, they are registered in the db. If they request a login code,
      // can we send it?
      // Wait, if they call login API and they are not verified, it says "Admin email not found. Please register first".
      // But if they are registered, they should just be verified.
      // What if we change `/api/auth/login` to allow unverified users to request an OTP code?
      // Or we can just let them use `/api/auth/login` to get their OTP code, and verification will mark them as `is_verified = true`!
      // Yes! In `/api/auth/login`, we check `if (!user || !user.is_verified)`. If we change this to `if (!user)`,
      // then anyone in `admin_users` can request a login code, and once verified, they become verified admin users!
      // Let's modify the check in `/api/auth/login` to check only `if (!user)`! This is much more robust!
      // We will make this quick adjustment in a moment.
      // For now, in `verify-otp/page.tsx`, we can just call `/api/auth/login` for resend! It will work perfectly if we check `if (!user)`.
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to resend code');
      }

      setSuccessMsg('A new verification code has been sent to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
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
            <Key className="w-6 h-6" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-widest text-[#2D2D2D] mb-2 uppercase">
          Verify OTP
        </h1>
        <p className="text-xs font-sans text-[#5A5A5A] mb-8 uppercase tracking-widest">
          Enter Verification Code
        </p>

        <p className="text-xs text-[#5A5A5A] font-sans mb-6">
          Enter the 8-digit verification code sent to <br />
          <span className="font-bold text-gold-700">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 8-box input */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mx-auto max-w-md">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                maxLength={1}
                value={data}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={isLoading || !!successMsg}
                className="w-8 h-10 sm:w-10 sm:h-12 text-base text-center font-bold font-mono rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50 transition-all text-zinc-900"
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-sans font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600 animate-pulse" />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !!successMsg}
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-serif font-semibold tracking-widest hover:from-gold-600 hover:to-gold-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer disabled:opacity-50 transition-all uppercase text-xs"
          >
            {isLoading ? 'Verifying Code...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gold-100/50 flex flex-col items-center gap-3">
          <p className="text-xs text-[#5A5A5A] font-sans">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending || !!successMsg}
            className="flex items-center gap-2 text-xs font-bold text-gold-600 hover:text-gold-700 disabled:text-[#9A9A9A] transition-colors cursor-pointer disabled:cursor-not-allowed hover:underline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0
              ? `Resend Code in ${resendCooldown}s`
              : 'Resend Code'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-[#FAF6F0]">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
