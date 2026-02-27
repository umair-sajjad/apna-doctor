import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">ApnaDoctor</h1>
            <nav className="flex gap-4">
              <Link href="/doctors" className="text-gray-600 hover:text-black">
                Find Doctors
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold text-black">
            Find the Right Doctor, Book Instantly
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Talk to our AI assistant or search directly. Get matched with
            verified doctors near you.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="flex gap-4">
              <Link
                href="/chat"
                className="rounded-md bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Chat with AI Assistant
              </Link>
              <Link
                href="/doctors"
                className="rounded-md border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="mt-2 text-gray-600">Verified Doctors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="mt-2 text-gray-600">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="mt-2 text-gray-600">Specializations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">5</div>
              <div className="mt-2 text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h3 className="text-center text-3xl font-bold text-black">
            How It Works
          </h3>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                1
              </div>
              <h4 className="mt-4 text-xl font-semibold">
                Tell Us What You Need
              </h4>
              <p className="mt-2 text-gray-600">
                Describe your health concern in simple words
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                2
              </div>
              <h4 className="mt-4 text-xl font-semibold">
                Get Matched with Doctors
              </h4>
              <p className="mt-2 text-gray-600">
                Our AI finds the best doctors near you
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                3
              </div>
              <h4 className="mt-4 text-xl font-semibold">Book Instantly</h4>
              <p className="mt-2 text-gray-600">
                Choose a time slot and confirm in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h3 className="text-center text-3xl font-bold text-black">
            Popular Specializations
          </h3>
          <div className="mt-12 grid grid-cols-4 gap-6">
            {[
              "General Physician",
              "Dermatologist",
              "Cardiologist",
              "Pediatrician",
              "Gynecologist",
              "Dentist",
              "Orthopedic",
              "ENT Specialist",
            ].map((spec) => (
              <Link
                key={spec}
                href={`/doctors?specialization=${spec}`}
                className="rounded-lg border border-gray-200 p-6 text-center hover:border-blue-500 hover:shadow-lg"
              >
                <div className="text-4xl">🏥</div>
                <div className="mt-3 font-semibold text-black">{spec}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-600">
          <p>&copy; 2024 ApnaDoctor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
