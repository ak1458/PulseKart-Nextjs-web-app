"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Shield,
  AlertCircle,
  Eye,
} from "@/lib/icons";
import { IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!formData.password) {
      setFormError("Password is required");
      return;
    }

    try {
      await login({ email: formData.email, password: formData.password });
      // AuthContext will handle redirect to /admin for admin users
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030712]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Secure Admin Portal
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            PulseKart <span className="text-teal-400">Admin</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            Manage your pharmacy operations, inventory, orders, and staff from one central dashboard.
          </p>

          {/* Features List */}
          <div className="space-y-3 text-left hidden lg:block">
            {[
              "Real-time inventory management",
              "Order processing & tracking",
              "Staff & pharmacist management",
              "Sales analytics & reports",
              "Coupon & pricing rules",
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 text-gray-400"
              >
                <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                </div>
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Staff Login</h2>
                  <p className="text-xs text-gray-500">Authorized personnel only</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@pulsekart.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-400 transition-colors"
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {(formError || authError) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formError || authError}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Access Dashboard <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Customer Login
                </Link>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <p className="mt-4 text-center text-xs text-gray-500">
            This is a secure system. Unauthorized access is prohibited and will be logged.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
