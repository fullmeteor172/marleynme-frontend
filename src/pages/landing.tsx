import { useState } from "react";
import { LandingNav } from "@/components/blocks/landing-nav";
import Footer from "@/components/blocks/footer";
import { TopGlow } from "@/components/ui/top-glow";
import { ServicesSection } from "@/components/blocks/services-section";
import Hero from "@/components/blocks/hero-section";
import { Timeline } from "@/components/blocks/timeline";
import { LoginDialog } from "@/components/auth/login-dialog";

export function LandingPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div className="relative overflow-hidden min-h-screen bg-white dark:bg-neutral-950">
      <TopGlow />
      <LandingNav onLoginClick={() => setShowLoginDialog(true)} />

      <div className="max-w-5xl flex flex-col mx-auto relative z-10">
        <Hero />
        <Timeline />
        <ServicesSection />
      </div>

      <Footer />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}
