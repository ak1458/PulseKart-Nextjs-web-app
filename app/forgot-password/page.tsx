"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "@/lib/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
              Forgot Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Password?
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Don't worry! It happens to the best of us. Enter your email address 
              and we'll send you a link to reset your password securely.
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
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">We'll send you a reset link</p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
            <p className="text-gray-500 text-sm">Enter your email to continue</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">
                    Email address<span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all"
                    />
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
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
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
                <h3 className="text-xl font-bold text-white mb-2">Check Your Email!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We've sent a password reset link to<br />
                  <span className="text-white">{email}</span>
                </p>
                <button
                  onClick={() => { setIsSubmitted(false); setEmail(""); }}
                  className="text-teal-400 text-sm hover:text-teal-300 transition-colors"
                >
                  Didn't receive it? Try again
                </button>
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
