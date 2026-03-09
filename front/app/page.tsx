import Link from "next/link";
import MouseAura from "../components/MouseAura";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-[#25343F]">
      {/* Mouse Aura Background */}
      <MouseAura />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Share Rides. Save Money.{" "}
          <span className="text-[#FF9B51]">Go Green.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#25343F]/60 max-w-2xl mb-10">
          TidRod connects travelers for shared journeys. Find rides, split
          costs, and discover new places through fellow travelers.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center px-8 py-4 bg-[#FF9B51] text-white font-medium rounded-full hover:bg-[#e8893f] transition-colors shadow-lg hover:shadow-xl"
        >
          Get Started
          <svg
            className="ml-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 bg-[#EAEFEF]/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#25343F]">
            Why Choose TidRod?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#BFC9D1]/20">
              <div className="w-12 h-12 bg-[#FF9B51]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#FF9B51]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Discover Places</h3>
              <p className="text-[#25343F]/60">
                Explore travel spots shared by real travelers. See their stories and photos on the map.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#BFC9D1]/20">
              <div className="w-12 h-12 bg-[#FF9B51]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#FF9B51]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Chat in Real-time</h3>
              <p className="text-[#25343F]/60">
                Ask questions, share tips, and plan trips together with live chat on every trip.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#BFC9D1]/20">
              <div className="w-12 h-12 bg-[#FF9B51]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#FF9B51]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Community Map</h3>
              <p className="text-[#25343F]/60">
                A crowd-sourced travel map that grows with every shared experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#25343F]">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-[#FF9B51] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#FF9B51]/30">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Create Account</h3>
              <p className="text-[#25343F]/60">Sign up in seconds and join the community.</p>
            </div>

            <div className="hidden md:block text-[#BFC9D1]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-[#FF9B51] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#FF9B51]/30">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Share Your Trip</h3>
              <p className="text-[#25343F]/60">Pin your travel experience on the map with photos and stories.</p>
            </div>

            <div className="hidden md:block text-[#BFC9D1]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-[#FF9B51] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#FF9B51]/30">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#25343F]">Connect & Explore</h3>
              <p className="text-[#25343F]/60">Chat with travelers and discover amazing places!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-16 px-6 bg-[#25343F] text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to explore the world?
        </h2>
        <p className="text-[#BFC9D1] mb-8 max-w-xl mx-auto">
          Join the community of travelers sharing their experiences on the map.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-8 py-4 bg-[#FF9B51] text-white font-medium rounded-full hover:bg-[#e8893f] transition-colors shadow-lg"
        >
          Join TidRod Today
        </Link>
      </section>
    </div>
  );
}
