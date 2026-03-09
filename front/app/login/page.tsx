"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/home",
        });
        if (error) {
          setError(error.message || "Failed to sign in");
        } else {
          router.push("/home");
        }
      } else {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/home",
        });
        if (error) {
          setError(error.message || "Failed to sign up");
        } else {
          router.push("/home");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0B] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphic card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-[#FF9B51] bg-clip-text text-transparent">
              TidRod
            </h1>
            <p className="text-neutral-400 mt-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-[#FF9B51] text-white shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-[#FF9B51] text-white shadow-lg"
                  : "text-neutral-400 hover:text-white"
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
                <label htmlFor="name" className="block text-sm text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-neutral-300 mb-2">
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
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              {!isLogin && (
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 8 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF9B51] text-white hover:text-[#FF9B51] font-semibold shadow-lg shadow-[#FF9B51]/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
          <div className="mt-6 text-center text-sm text-neutral-500">
            {isLogin ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 -z-10" />
      </div>
    </div>
  );
}
