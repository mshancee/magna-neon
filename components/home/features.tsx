"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code, Rocket, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Code,
    title: "Code Collaboration",
    description:
      "Work together in real-time with developers worldwide, using integrated tools for seamless coding experiences.",
    cta: "Start Coding",
    link: "/code",
  },
  {
    icon: Rocket,
    title: "Launch Projects",
    description:
      "Turn ideas into reality with our project management and deployment tools, optimized for rapid development.",
    cta: "Launch Now",
    link: "/projects",
  },
  {
    icon: Users,
    title: "Join Communities",
    description:
      "Connect with like-minded innovators in vibrant communities to share knowledge and grow together.",
    cta: "Join Community",
    link: "/community",
  },
];

export function FeaturesSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const handleNavigation = (path: string, feature: string) => {
    setIsLoading((prev) => ({ ...prev, [feature]: true }));
    setTimeout(() => {
      router.push(path);
    }, 1000); // Simulate network delay
  };

  return (
    <section className="relative py-20 ">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why <span className="text-[#F9E4AD]">Magna Coders</span>?
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#FF9940] max-w-3xl mx-auto">
            Empowering developers with tools, community, and opportunities to
            build the future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="backdrop-blur-md rounded-xl border border-border/50 shadow-xl p-6 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300"
            >
              <feature.icon className="w-12 h-12 text-[#E70008] mb-4" />
              <h3 className="text-xl font-semibold text-[#F9E4AD] mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {feature.description}
              </p>
              <Button
                className="bg-[#E70008] hover:bg-[#D60007] text-[#F9E4AD] h-12 border-none px-6 py-3 text-base font-mono font-semibold rounded-xl w-full md:w-auto relative overflow-hidden"
                onClick={() => handleNavigation(feature.link, feature.title)}
                disabled={isLoading[feature.title]}
              >
                <AnimatePresence>
                  {isLoading[feature.title] ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <span>{feature.cta}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isLoading[feature.title] ? 0 : 1.5,
                    opacity: isLoading[feature.title] ? 0 : 0.3,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
