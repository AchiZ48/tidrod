"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, removeToken, getToken } from "@/lib/api";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);
  }, []);

  const handleSignOut = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="fixed left-4 right-4 flex h-[56px] rounded-full py-4 my-4 backdrop-blur-md bg-white/80 shadow-md shrink-0 z-50 border border-[#BFC9D1]/30">
      <div className="flex justify-between items-center w-full">
        {/* Logo */}
        <div>
          <Link href="/" className="text-xl font-bold m-auto mx-10 text-[#25343F]">
            <span className="text-[#FF9B51]">Tid</span>Rod
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex gap-8 mx-10 items-center">
          <Link href="/home" className="text-[#25343F]/70 hover:text-[#FF9B51] transition-colors font-medium text-sm">
            Map
          </Link>
          <Link href="/" className="text-[#25343F]/70 hover:text-[#FF9B51] transition-colors font-medium text-sm">
            Home
          </Link>

          {/* Auth Section */}
          {loading ? (
            <div className="w-20 h-8 bg-[#EAEFEF] rounded-full animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#25343F]/60 hidden sm:inline font-medium">
                {user.username}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 text-sm rounded-full bg-[#25343F] text-white hover:bg-[#25343F]/80 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-1.5 text-sm rounded-full bg-[#FF9B51] text-white hover:bg-[#e8893f] transition-colors shadow-md font-semibold"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
