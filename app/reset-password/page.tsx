"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";
import {
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
} from "@/lib/icons";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState("");

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show token error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row">
        <Link
          href="/login"
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a0f1a] to-[#0f172a]" />
          <div className="absolute inset-0 bg-[url('/images/pharmacy-bg.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#030712] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#030712] to-transparent" />
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <div className="relative z-10 w-full max-w-sm">
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Invalid Link</h3>
              <p className="text-gray-400 text-sm mb-6">{tokenError}</p>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row">
      {/* Mobile: Back Button */}
      <Link
        href="/login"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Desktop Left Side */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a0f1a] to-[#0f172a]" />
        <div className="absolute inset-0 bg-[url('/images/pharmacy-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#030712] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#030712] to-transparent" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="PulseKart"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                Pulse<span className="text-teal-400">Kart</span>
              </span>
            </Link>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Secure Password Reset
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Create New{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Password
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Enter your new password below. Make sure it&apos;s strong and unique.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#030712]" />
        <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="PulseKart"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Desktop Back */}
          <Link
            href="/login"
            className="hidden lg:flex absolute -top-12 left-0 items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Mobile Heading */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-500 text-sm">Create your new password</p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">New Password</h2>
            <p className="text-gray-500 text-sm">Enter a strong password</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">
                    New Password<span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">
                    Confirm Password<span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Your password has been successfully reset. Redirecting you to login...
                </p>
                <Link
                  href="/login"
                  className="text-teal-400 text-sm hover:text-teal-300 transition-colors"
                >
                  Click here if not redirected
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sign In Link */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
