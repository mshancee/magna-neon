"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, GitBranch, Zap, Play, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const typewriterPhrases = [
  "Magna Coders",
  "Build. Collaborate.",
  "Code the Future",
  "Join the Revolution",
];

const codeSnippets = [
  `// Welcome to the future of development
const community = {
  developers: 1000+,
  projects: 'unlimited',
  innovation: 'continuous'
};

function joinCommunity() {
  return community.developers.map(dev => 
    dev.skills + dev.passion
  ).reduce((acc, val) => acc + val, 'amazing');
}



const future = new Innovation();`,

  `import { creativity, passion } from 'developer';
import { community, support } from 'magna-coders';

export default function BuildFuture() {
  const skills = ['React', 'AI/ML', 'Blockchain'];
  const vision = 'world-changing';
  
  return (
    <div className="future">
      {skills.map(skill => (
        <Innovation key={skill} tech={skill} />
      ))}
    </div>
  );
}`,
];

export function HeroSection() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [codeCharIndex, setCodeCharIndex] = useState(0);

  useEffect(() => {
    const currentPhrase = typewriterPhrases[currentPhraseIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayedText.length < currentPhrase.length) {
            setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2500);
          }
        } else {
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentPhraseIndex(
              (prev) => (prev + 1) % typewriterPhrases.length
            );
          }
        }
      },
      isDeleting ? 50 : 120
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  useEffect(() => {
    const currentSnippet = codeSnippets[currentCodeIndex];

    if (codeCharIndex < currentSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(currentSnippet.slice(0, codeCharIndex + 1));
        setCodeCharIndex((prev) => prev + 1);
      }, Math.random() * 40 + 25);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentCodeIndex((prev) => (prev + 1) % codeSnippets.length);
        setDisplayedCode("");
        setCodeCharIndex(0);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [codeCharIndex, currentCodeIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-fixe">
      {/* Background image */}
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        priority
        className="absolute inset-0 object-cover opacity-20"
      />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-screen py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8 text-center lg:text-left"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 border-2  border-white backdrop-blur-sm rounded-full"
              >
                <Code2 className="w-4 h-4 text-white" />
                <span className="text-sm font-mono text-white">
                  magna-coders
                </span>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-[#F9E4AD]">
                  {displayedText}
                  <span className="animate-pulse text-secondary">|</span>
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl lg:text-2xl text-[#FF9940] max-w-2xl leading-relaxed text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Connect with passionate developers, designers, and innovators
                building tomorrow&apos;s technology today.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 items-center lg:items-start justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#E70008] hover:bg-[#D60007] text-[#F9E4AD] px-8 py-4 text-lg font-mono font-semibold group border-none rounded-2xl h-12 w-full sm:w-auto"
                >
                  <Play className="mr-2 w-5 h-5" />
                  <span>Start building</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/community">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 h-12 rounded-2xl border-[#E70008] text-[#F9E4AD] hover:bg-secondary hover:text-secondary-foreground px-8 py-4 text-lg font-bold font-mono bg-transparent w-full sm:w-auto"
                >
                  <GitBranch className="mr-2 w-5 h-5" />
                  <span>{"git clone community"}</span>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">1k+ developers</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="font-mono text-sm">50+ projects</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-xl">
              <div className="bg-gray-950 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-border/30">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-muted-foreground text-sm font-mono">
                    innovation.js
                  </div>
                  <div className="w-6 h-6"></div>
                </div>

                {/* Terminal content with fixed height */}
                <div className="p-6 h-auto overflow-hidden">
                  <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    <code className="text-foreground">
                      {displayedCode}
                      <span className="animate-pulse bg-primary w-2 h-5 inline-block ml-1"></span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
