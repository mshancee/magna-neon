'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function AboutUs() {
  // States for "Magna Coders" title
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [isBouncing, setIsBouncing] = useState(false);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // States for "Our Story" title
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyBallPosition, setStoryBallPosition] = useState({ x: 0, y: 0 });
  const [isStoryBouncing, setIsStoryBouncing] = useState(false);
  const storyLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // States for "Why We Exist" title
  const [existIndex, setExistIndex] = useState(0);
  const [existBallPosition, setExistBallPosition] = useState({ x: 0, y: 0 });
  const [isExistBouncing, setIsExistBouncing] = useState(false);
  const existLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Animation for "Magna Coders"
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % 12);
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 150);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Animation for "Our Story"
  useEffect(() => {
    const interval = setInterval(() => {
      setStoryIndex(prev => (prev + 1) % 9); // "Our Story" has 9 characters (including space)
      setIsStoryBouncing(true);
      setTimeout(() => setIsStoryBouncing(false), 150);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Animation for "Why We Exist"
  useEffect(() => {
    const interval = setInterval(() => {
      setExistIndex(prev => (prev + 1) % 11); // "Why We Exist" has 11 characters (including spaces)
      setIsExistBouncing(true);
      setTimeout(() => setIsExistBouncing(false), 150);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Position calculation for "Magna Coders" ball
  useEffect(() => {
    if (letterRefs.current[currentIndex]) {
      const letter = letterRefs.current[currentIndex];
      if (letter) {
        const rect = letter.getBoundingClientRect();
        const containerRect = letter.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setBallPosition({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top // Touch top of letter
          });
        }
      }
    }
  }, [currentIndex]);

  // Position calculation for "Our Story" ball
  useEffect(() => {
    if (storyLetterRefs.current[storyIndex]) {
      const letter = storyLetterRefs.current[storyIndex];
      if (letter) {
        const rect = letter.getBoundingClientRect();
        const containerRect = letter.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setStoryBallPosition({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top // Touch top of letter
          });
        }
      }
    }
  }, [storyIndex]);

  // Position calculation for "Why We Exist" ball
  useEffect(() => {
    if (existLetterRefs.current[existIndex]) {
      const letter = existLetterRefs.current[existIndex];
      if (letter) {
        const rect = letter.getBoundingClientRect();
        const containerRect = letter.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setExistBallPosition({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top // Touch top of letter
          });
        }
      }
    }
  }, [existIndex]);

  const title = "Magna Coders";
  const letters = title.split('');
  const storyTitle = "Our Story";
  const storyLetters = storyTitle.split('');
  const existTitle = "Why We Exist";
  const existLetters = existTitle.split('');

  const setLetterRef = useCallback((index: number) => (el: HTMLSpanElement | null) => {
    letterRefs.current[index] = el;
  }, []);

  const setStoryLetterRef = useCallback((index: number) => (el: HTMLSpanElement | null) => {
    storyLetterRefs.current[index] = el;
  }, []);

  const setExistLetterRef = useCallback((index: number) => (el: HTMLSpanElement | null) => {
    existLetterRefs.current[index] = el;
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative inline-block mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-mono flex justify-center items-center relative flex-wrap">
              {letters.map((letter, index) => (
                <span
                  key={index}
                  ref={setLetterRef(index)}
                  className={`transition-colors duration-200 px-0.5 sm:px-1 ${
                    index === currentIndex 
                      ? 'text-[#E70008]' 
                      : 'text-[#F9E4AD]'
                  }`}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
              
              {/* Bouncing red ball for "Magna Coders" */}
              <div 
                className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#E70008] rounded-full transition-all duration-300 ease-out ${
                  isBouncing ? 'scale-150 translate-y-[-2px] sm:translate-y-[-3px] md:translate-y-[-4px]' : 'scale-100 translate-y-0'
                }`}
                style={{
                  left: `${ballPosition.x}px`,
                  top: `${ballPosition.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              />
            </h1>
          </div>
          
          <div className="text-center max-w-3xl mx-auto px-2 space-y-6 sm:space-y-8">
            {/* First Section */}
            <div className="border border-[#E70008] rounded-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
              <p className="text-lg sm:text-xl md:text-2xl text-[#F9E4AD] font-mono leading-relaxed mb-6 sm:mb-8">
                Magna Coders is more than just a platform — it&apos;s a community of builders.
              </p>
              
              <div className="text-left max-w-2xl mx-auto">
                <p className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed mb-4 sm:mb-6">
                  Here, developers, designers, and problem-solvers come together to:
                </p>
                
                <ul className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed space-y-2 sm:space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>Showcase their skills.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>Form dynamic teams.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>Build real solutions for real problems.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Our Story Section */}
            <div className="border border-[#E70008] rounded-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
              <div className="relative inline-block mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-mono flex justify-start items-center relative">
                  {storyLetters.map((letter, index) => (
                    <span
                      key={index}
                      ref={setStoryLetterRef(index)}
                      className={`transition-colors duration-200 px-0.5 sm:px-1 ${
                        index === storyIndex 
                          ? 'text-[#E70008]' 
                          : 'text-[#F9E4AD]'
                      }`}
                    >
                      {letter === ' ' ? '\u00A0' : letter}
                    </span>
                  ))}
                  
                  {/* Bouncing cream ball for "Our Story" */}
                  <div 
                    className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#F9E4AD] rounded-full transition-all duration-300 ease-out ${
                      isStoryBouncing ? 'scale-150 translate-y-[-2px] sm:translate-y-[-3px] md:translate-y-[-4px]' : 'scale-100 translate-y-0'
                    }`}
                    style={{
                      left: `${storyBallPosition.x}px`,
                      top: `${storyBallPosition.y}px`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  />
                </h2>
              </div>
              
              <div className="text-left">
                <p className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed mb-4">
                  This project began with a simple question:
                </p>
                
                <p className="text-base sm:text-lg text-[#F9E4AD] font-mono italic leading-relaxed mb-4 pl-4 border-l-2 border-[#E70008]">
                  &ldquo;What if a group of people could come together, find a problem in society, and solve it with technology?&rdquo;
                </p>
                
                <p className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed mb-4">
                  From that spark, Magna Coders was born.
                </p>
                
                <p className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed">
                  What started as a small gathering of ideas is now evolving into a living ecosystem of skills, collaboration, and impact.
                </p>
              </div>
            </div>

            {/* Why We Exist Section */}
            <div className="border border-[#E70008] rounded-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
              <div className="relative inline-block mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-mono flex justify-start items-center relative">
                  {existLetters.map((letter, index) => (
                    <span
                      key={index}
                      ref={setExistLetterRef(index)}
                      className={`transition-colors duration-200 px-0.5 sm:px-1 ${
                        index === existIndex 
                          ? 'text-[#E70008]' 
                          : 'text-[#F9E4AD]'
                      }`}
                    >
                      {letter === ' ' ? '\u00A0' : letter}
                    </span>
                  ))}
                  
                  {/* Bouncing cream ball for "Why We Exist" */}
                  <div 
                    className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#F9E4AD] rounded-full transition-all duration-300 ease-out ${
                      isExistBouncing ? 'scale-150 translate-y-[-2px] sm:translate-y-[-3px] md:translate-y-[-4px]' : 'scale-100 translate-y-0'
                    }`}
                    style={{
                      left: `${existBallPosition.x}px`,
                      top: `${existBallPosition.y}px`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  />
                </h2>
              </div>
              
              <div className="text-left max-w-2xl mx-auto">
                <ul className="text-base sm:text-lg text-[#F9E4AD] font-mono leading-relaxed space-y-4 sm:space-y-5">
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>To break the cycle of isolation and fragmented talent.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>To give every coder, designer, and thinker a place to belong and contribute.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E70008] mr-2 sm:mr-3">•</span>
                    <span>To turn scattered energy into coherent teams solving meaningful problems.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}