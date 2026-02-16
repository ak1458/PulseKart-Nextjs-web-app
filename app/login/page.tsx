"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  Users,
  BarChart2,
  Settings,
} from "@/lib/icons";
import { IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formError) setFormError("");
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!formData.password) {
      setFormError("Password is required");
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  // Social Login Handler
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setFormError("");
    try {
      const response = await fetch(`/api/v1/auth/${provider}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          // Redirect to OAuth provider
          window.location.href = data.url;
        } else if (data.access_token) {
          // Already authenticated
          await login({ 
            email: data.user.email, 
            password: '',
            socialToken: data.access_token 
          });
        }
      } else {
        setFormError(`${provider === 'google' ? 'Google' : 'Apple'} login is currently unavailable. Please try email login.`);
      }
    } catch (error) {
      setFormError(`${provider === 'google' ? 'Google' : 'Apple'} login failed. Please try again.`);
    }
  };

  // Features for desktop left side
  const features = [
    { icon: Activity, label: "Real-time Inventory" },
    { icon: Users, label: "Staff Management" },
    { icon: BarChart2, label: "Sales Analytics" },
    { icon: Settings, label: "System Controls" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col lg:flex-row">
      {/* Mobile: Back Button (Top Left) */}
      <Link
        href="/"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Desktop Left Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a0f1a] to-[#0f172a]" />
        <div className="absolute inset-0 bg-[url('/images/pharmacy-bg.jpg')] bg-cover bg-center opacity-20" />
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#030712] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#030712] to-transparent" />
        
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
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

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome to PulseKart
            </div>

            {/* Heading */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Your Health,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Delivered
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
              Access your personalized health dashboard, track orders, manage prescriptions, 
              and connect with healthcare professionals.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-teal-500/20 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form (Mobile & Desktop) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#030712]" />
        <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px]" />

        {/* Login Card */}
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

          {/* Desktop Back Button */}
          <Link
            href="/"
            className="hidden lg:flex absolute -top-12 left-0 items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Mobile Heading */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-gray-500 text-sm">
              Sign in to access your health and pharmacy needs
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">
                  Email address<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">
                  Password<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              {(formError || authError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {formError || authError}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">Or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin('apple')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.04 4.02-.74c.67.07 2.52.33 3.71 1.97-.07.04-2.21 1.28-2.19 3.84.02 3.06 2.67 4.08 2.71 4.1-.02.1-.42 1.44-1.38 2.83M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
              Sign up
            </Link>
          </p>

          {/* Staff Login Link */}
          <p className="mt-3 text-center text-xs text-gray-600">
            <Link href="/admin/login" className="hover:text-gray-400 transition-colors flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Staff Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
