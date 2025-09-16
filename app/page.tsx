"use client";

import PWAInstaller from "@/components/pwa/PWAInstaller";
import { HeroSection } from "@/components/home/hero-section";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Content */}
      <HeroSection />
      <PWAInstaller />
    </div>
  );
}
