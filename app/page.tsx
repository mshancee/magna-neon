//import PWAInstaller from "@/components/pwa/PWAInstaller";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden g-cover bg-center bg-fixed">
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        priority
        className="absolute inset-0 object-cover opacity-20 transition-opacity duration-500"
      />
      <HeroSection />
      <FeaturesSection />
      {/* <PWAInstaller /> */}
    </div>
  );
}

// you can export metadata here
