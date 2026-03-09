"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <header className="fixed left-4 right-4 flex h-[56px] rounded-full py-4 my-4 backdrop-blur-none bg-neutral-50 shadow-md shrink-0 z-50">
      <div className="flex justify-between items-center w-full">
        {/* Logo */}
        <div>
          <Link href="/" className="text-xl font-bold m-auto mx-10">
            TidRod
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex gap-10 mx-10 items-center">
          <Link href="/" className="hover:text-blue-500">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-500">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-500">
            Contact
          </Link>

          {/* Auth Section */}
          {isPending ? (
            <div className="w-20 h-8 bg-neutral-200 rounded-full animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600 hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 text-sm rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
