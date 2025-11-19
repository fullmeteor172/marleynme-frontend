import { Nav } from "./components/blocks/nav";
import Footer from "./components/blocks/footer";
import { TopGlow } from "./components/ui/top-glow";
import { ServicesGrid } from "./components/blocks/services-section";
import Hero from "./components/blocks/hero-section";
import { Timeline } from "./components/blocks/timeline"; // Import Timeline

function App() {
  return (
    // Added "relative" and "overflow-hidden" here
    <div className="relative overflow-hidden min-h-screen bg-white dark:bg-neutral-950">
      {/* The Glow Effect */}
      <TopGlow />
      <Nav />
      {/* Hero Section */}
      {/* Added "relative" to ensure content sits above the glow */}
      <div className="max-w-5xl flex flex-col mx-auto relative z-10">
        <Hero />
        <Timeline />

        {/* ... Rest of your sections (Features, Pricing, etc.) ... */}
        <ServicesGrid />

        <section
          id="features"
          className="min-h-screen flex items-center justify-center px-4 py-20 bg-neutral-50 dark:bg-neutral-900"
        >
          {/* ... content ... */}
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 dark:text-white mb-12">
              Our Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white dark:bg-neutral-950 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Veterinary Care
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Expert veterinary services with experienced doctors who care
                  about your pet's health.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-neutral-950 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">✂️</div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Grooming
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Professional grooming services to keep your pet looking and
                  feeling their best.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-neutral-950 rounded-lg shadow-lg">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Boarding
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Safe and comfortable boarding facilities where your pet feels
                  at home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="min-h-screen flex items-center justify-center px-4 py-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 dark:text-white mb-12">
              Pricing Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Basic Care
                </h3>
                <p className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                  ₹999
                  <span className="text-lg font-normal text-neutral-600 dark:text-neutral-300">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> Monthly checkup
                  </li>
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> Basic grooming
                  </li>
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> 24/7 helpline
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold hover:opacity-90 transition">
                  Choose Plan
                </button>
              </div>
              <div className="p-8 bg-blue-600 text-white rounded-lg transform scale-105 shadow-xl">
                <h3 className="text-2xl font-semibold mb-4">Premium Care</h3>
                <p className="text-4xl font-bold mb-6">
                  ₹1,999<span className="text-lg font-normal">/month</span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> All Basic features
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Priority appointments
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Premium grooming
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Free boarding (2 days/month)
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:opacity-90 transition">
                  Choose Plan
                </button>
              </div>
              <div className="p-8 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Elite Care
                </h3>
                <p className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                  ₹3,499
                  <span className="text-lg font-normal text-neutral-600 dark:text-neutral-300">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> All Premium features
                  </li>
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> Home visits
                  </li>
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> Personalized diet plan
                  </li>
                  <li className="flex items-center text-neutral-600 dark:text-neutral-300">
                    <span className="mr-2">✓</span> Unlimited boarding
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold hover:opacity-90 transition">
                  Choose Plan
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="min-h-screen flex items-center justify-center px-4 py-20 bg-neutral-50 dark:bg-neutral-900"
        >
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 dark:text-white mb-12">
              Get in Touch
            </h2>
            <div className="bg-white dark:bg-neutral-950 p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                    placeholder="Tell us about your pet and how we can help..."
                  />
                </div>
                <button className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                  Send Message
                </button>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-neutral-600 dark:text-neutral-300">
                📍 Located in Hyderabad, Telangana
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                📞 Call us: +91 98765 43210
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default App;
