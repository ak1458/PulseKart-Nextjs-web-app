"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "@/lib/icons";

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual password reset API call
      // const response = await fetch(apiUrl('auth/forgot-password'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030712]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]" />

      {/* Floating Orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-[150px]"
      />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <Link href="/">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img
                src="/logo.png"
                alt="PulseKart"
                className="h-12 w-auto relative z-10 brightness-0 invert group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </Link>
        </motion.div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-white/[0.03]">
          <div className="p-8">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-300 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-400 text-sm">
                No worries! Enter your email and we&apos;ll send you a reset link.
              </p>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Success State */}
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="text-teal-300">{email}</span>
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all"
                >
                  Return to Login
                </Link>
              </motion.div>
            ) : (
              /* Form */
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                    Email address <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all hover:bg-white/[0.07]"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Sending...
                    </>
                  ) : (
                    <>Send Reset Link</>
                  )}
                </button>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-500">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-teal-400 font-semibold hover:text-teal-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Need help?{" "}
          <Link
            href="/help"
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            Contact Support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
