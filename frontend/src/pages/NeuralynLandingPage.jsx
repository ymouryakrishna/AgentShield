import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { WordReveal } from '../components/WordReveal';

export default function NeuralynLandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroContentY = useTransform(heroScroll, [0, 1], [0, -200]);
  const heroContentOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const dashboardY = useTransform(heroScroll, [0, 1], [0, -250]);

  const testimonialRef = useRef(null);
  const { scrollYProgress: testimonialScroll } = useScroll({
    target: testimonialRef,
    offset: ['start end', 'end center'],
  });

  const testimonialText =
    'Neuralyn revolutionized how we handle financial insights using smart analytics. We are now driving better outcomes quicker than we ever imagined! Neuralyn revolutionized how we handle financial insights using smart analytics.';
  const words = testimonialText.split(' ');

  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen">
      {/* SECTION 1: HERO */}
      <section
        ref={heroRef}
        className="relative h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* Navbar */}
        <header className="relative z-40 w-full px-8 md:px-28 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12 md:gap-20">
            <a href="#" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Neuralyn Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Neuralyn
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <a href="#home" className="px-3 py-2 text-foreground">
                Home
              </a>
              <button className="flex items-center gap-1 px-3 py-2 hover:text-foreground transition-colors cursor-pointer">
                Services
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              <a
                href="#reviews"
                className="px-3 py-2 hover:text-foreground transition-colors"
              >
                Reviews
              </a>
              <a
                href="#contact"
                className="px-3 py-2 hover:text-foreground transition-colors"
              >
                Contact us
              </a>
            </nav>
          </div>

          <button className="bg-foreground text-background font-semibold rounded-lg text-sm px-5 py-2.5 transition-opacity hover:opacity-90 cursor-pointer">
            Sign In
          </button>
        </header>

        {/* Hero Content */}
        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-30 flex flex-col items-center text-center mt-16 md:mt-20 px-4 max-w-5xl mx-auto"
        >
          {/* Tag pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="liquid-glass rounded-lg px-3 py-2 mb-6 flex items-center gap-2.5"
          >
            <span className="bg-foreground text-background text-sm font-medium px-2 py-0.5 rounded-md">
              New
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Say Hello to Corewave v3.2
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl tracking-[-2px] font-medium leading-tight md:leading-[1.15] mb-3"
          >
            Your Insights. <br />
            One Clear{' '}
            <span className="font-serif italic font-normal">Overview</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg font-normal leading-6 mb-8 text-hero-subtitle opacity-90 max-w-xl"
          >
            Neuralyn helps teams track metrics, goals,
            <br />
            and progress with precision.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-foreground text-background font-medium rounded-full px-8 py-3.5 text-base shadow-xl cursor-pointer"
          >
            Get Started for Free
          </motion.button>
        </motion.div>

        {/* Dashboard + Video Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-screen aspect-[16/9] z-10"
          style={{ marginLeft: 'calc(-50vw + 50%)' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <motion.img
              style={{ y: dashboardY, mixBlendMode: 'luminosity' }}
              src="/hero-dashboard.png"
              alt="Neuralyn Analytics Dashboard"
              className="w-[90%] max-w-5xl rounded-2xl shadow-2xl border border-border/40"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-30 pointer-events-none" />
        </motion.div>
      </section>

      {/* SECTION 2: TESTIMONIAL */}
      <section
        ref={testimonialRef}
        id="reviews"
        className="min-h-screen flex items-center justify-center py-24 md:py-32 px-8 md:px-28 relative z-30"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-start gap-10">
          <img
            src="/quote-symbol.png"
            alt="Quote mark"
            className="w-14 h-10 object-contain"
          />

          <div className="text-4xl md:text-5xl font-medium leading-[1.2] flex flex-wrap tracking-tight">
            {words.map((word, index) => (
              <WordReveal
                key={index}
                word={word}
                index={index}
                total={words.length}
                progress={testimonialScroll}
              />
            ))}
            <span className="text-muted-foreground ml-2">”</span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src="/testimonial-avatar.png"
              alt="Brooklyn Simmons"
              className="w-14 h-14 rounded-full border-[3px] border-foreground object-cover"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-7 text-foreground">
                Brooklyn Simmons
              </span>
              <span className="text-sm font-normal leading-5 text-muted-foreground">
                Product Manager
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
