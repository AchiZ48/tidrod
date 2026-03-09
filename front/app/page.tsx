import Link from "next/link";
import MouseAura from "../components/MouseAura";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      {/* Mouse Aura Background */}
      <MouseAura />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Share Rides. Save Money.{" "}
          <span className="text-indigo-600">Go Green.</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-10">
          TidRod connects students for easy campus carpooling. Find rides, split
          costs, and reduce your carbon footprint.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
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
      <section className="relative z-10 py-20 px-6 bg-gray-50/80">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose TidRod?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Rides Instantly</h3>
              <p className="text-gray-600">
                Quick matching with students going your way. No more waiting at
                bus stops.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Split Costs</h3>
              <p className="text-gray-600">
                Save on gas and parking fees. Fair cost sharing makes commuting
                affordable.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">
                Reduce your carbon footprint. Every shared ride helps the
                planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up with your campus email in seconds.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-gray-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Post or Search</h3>
              <p className="text-gray-600">
                Offer a ride or find one that fits your schedule.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-gray-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Ride Together</h3>
              <p className="text-gray-600">
                Confirm, connect, and enjoy the commute!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-16 px-6 bg-indigo-600 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to start carpooling?
        </h2>
        <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
          Join thousands of students already saving money and the environment.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-medium rounded-full hover:bg-gray-100 transition-colors shadow-lg"
        >
          Join TidRod Today
        </Link>
      </section>
    </div>
  );
}
