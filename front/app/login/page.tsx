"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        setToken(data.token);
        router.push("/home");
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setIsLoading(false);
          return;
        }
        const data = await registerUser(name, email, password);
        setToken(data.token);
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#25343F] via-[#1a2a35] to-[#0f1c24] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF9B51]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#BFC9D1]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF9B51]/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-[#FF9B51]">Tid</span><span className="text-white">Rod</span>
            </h1>
            <p className="text-[#BFC9D1] mt-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-[#FF9B51] text-white shadow-lg"
                  : "text-[#BFC9D1] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-[#FF9B51] text-white shadow-lg"
                  : "text-[#BFC9D1] hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm text-[#BFC9D1] mb-2">
                  Username
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="traveler_name"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#BFC9D1]/50 focus:outline-none focus:ring-2 focus:ring-[#FF9B51]/50 focus:border-[#FF9B51]/50 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-[#BFC9D1] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#BFC9D1]/50 focus:outline-none focus:ring-2 focus:ring-[#FF9B51]/50 focus:border-[#FF9B51]/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#BFC9D1] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#BFC9D1]/50 focus:outline-none focus:ring-2 focus:ring-[#FF9B51]/50 focus:border-[#FF9B51]/50 transition-all"
              />
              {!isLogin && (
                <p className="text-xs text-[#BFC9D1]/50 mt-1">
                  Minimum 8 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF9B51] text-white hover:text-[#FF9B51] font-semibold shadow-lg shadow-[#FF9B51]/25 hover:shadow-[#FF9B51]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-[#BFC9D1]/60">
            {isLogin ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className="text-[#FF9B51] hover:text-[#e8893f] font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className="text-[#FF9B51] hover:text-[#e8893f] font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9B51] via-[#BFC9D1] to-[#FF9B51] rounded-3xl blur-xl opacity-15 -z-10" />
      </div>
    </div>
  );
}
