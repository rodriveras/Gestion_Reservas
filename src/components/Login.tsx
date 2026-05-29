/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Trees, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
  expectedUser?: string;
  expectedPassword?: string;
  complexName?: string;
}

export default function Login({
  onLoginSuccess,
  expectedUser = "admin@entrenieves.com",
  expectedPassword = "nieves2026",
  complexName = "Entre Nieves"
}: LoginProps) {
  const [username, setUsername] = useState("admin@entrenieves.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simulate slight network validation delay for premium feel
    setTimeout(() => {
      if (
        username.trim().toLowerCase() === expectedUser.toLowerCase() &&
        password === expectedPassword
      ) {
        localStorage.setItem("pms_logged_in", "true");
        onLoginSuccess();
      } else {
        setError("Usuario del sistema o contraseña incorrectos");
        setIsSubmitting(false);
      }
    }, 600);
  };

  const handleSandboxBypass = () => {
    setError("");
    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.setItem("pms_logged_in", "true");
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-between bg-[#040604] overflow-hidden select-none">
      {/* Background Mountain Lodge at Night (HD image from Unsplash with blur-glass filter) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1920&q=80"
          alt="Lodge de Montaña"
          className="w-full h-full object-cover brightness-[0.35] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-[#040604] z-10"></div>
      </div>

      {/* Spacing spacer to push content down */}
      <div></div>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-[90%] max-w-[430px] bg-[#0c0e0c]/85 border border-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-20 relative space-y-6 md:space-y-8"
      >
        {/* Card Header (Logo + Brand Name) */}
        <div className="text-center space-y-2.5">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#3c4a3e]/30 border border-[#b2ceb4]/20 flex items-center justify-center shadow-lg">
            <Trees className="w-6 h-6 text-[#b2ceb4]" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-headline text-2xl md:text-3xl font-normal italic tracking-wide text-neutral-100">
              {complexName}
            </h2>
            <p className="text-[9px] md:text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-[0.25em]">
              Lodge de Montaña
            </p>
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message Alert Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 font-sans text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Field: Username */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold text-[#d29b6c] uppercase tracking-wider">
              Usuario del Sistema
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@entrenieves.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-[#121412] text-neutral-200 border border-neutral-800 focus:border-[#b2ceb4] rounded-xl text-xs font-semibold outline-none transition-colors disabled:opacity-50"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Field: Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-sans font-bold text-[#d29b6c] uppercase tracking-wider">
              Contraseña Administrativa
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-3 bg-[#121412] text-neutral-200 border border-neutral-800 focus:border-[#b2ceb4] rounded-xl text-xs font-semibold outline-none transition-colors disabled:opacity-50"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 bg-[#4e5f52] hover:bg-[#5b6e60] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(78,95,82,0.3)] hover:shadow-[0_4px_25px_rgba(78,95,82,0.5)] border border-emerald-950/20 active:scale-[0.98] transition-all text-xs font-sans uppercase tracking-[0.15em] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Acceder al Gestor"
            )}
          </button>
        </form>

      </motion.div>

      {/* Footer Branding Area */}
      <div className="pb-6 z-20">
        <p className="text-[9px] md:text-[10px] font-sans font-semibold text-neutral-600 uppercase tracking-widest">
          {complexName} Lodge © 2026 - Control Panel
        </p>
      </div>
    </div>
  );
}
