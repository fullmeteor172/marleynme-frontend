import { Nav } from "./components/blocks/nav";
import Footer from "./components/blocks/footer";
import { TopGlow } from "./components/ui/top-glow";
import { ServicesSection } from "./components/blocks/services-section";
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
        <ServicesSection />
      </div>

      <Footer />
    </div>
  );
}

export default App;
