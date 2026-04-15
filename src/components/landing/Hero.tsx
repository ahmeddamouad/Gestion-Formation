"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

// Floating icons representing Power BI concepts
const courseIcons = [
  {
    id: "dashboard",
    label: "Dashboards",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    position: "top-[15%] left-[10%]",
    delay: "0s",
    size: "w-16 h-16",
  },
  {
    id: "data",
    label: "Donnees",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    position: "top-[20%] right-[12%]",
    delay: "0.5s",
    size: "w-14 h-14",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    position: "bottom-[25%] left-[8%]",
    delay: "1s",
    size: "w-16 h-16",
  },
  {
    id: "kpi",
    label: "KPIs",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    position: "bottom-[30%] right-[10%]",
    delay: "1.5s",
    size: "w-12 h-12",
  },
];

// Fixed particle positions to avoid hydration mismatch
const fixedParticles = [
  { id: 0, size: 2.5, x: 5, y: 10, duration: 18, delay: 0.5 },
  { id: 1, size: 1.8, x: 15, y: 25, duration: 22, delay: 1.2 },
  { id: 2, size: 3.2, x: 25, y: 45, duration: 15, delay: 2.0 },
  { id: 3, size: 2.0, x: 35, y: 15, duration: 20, delay: 0.8 },
  { id: 4, size: 2.8, x: 45, y: 60, duration: 17, delay: 1.5 },
  { id: 5, size: 1.5, x: 55, y: 30, duration: 25, delay: 0.3 },
  { id: 6, size: 3.5, x: 65, y: 75, duration: 19, delay: 2.5 },
  { id: 7, size: 2.2, x: 75, y: 20, duration: 21, delay: 1.0 },
  { id: 8, size: 1.9, x: 85, y: 50, duration: 16, delay: 3.0 },
  { id: 9, size: 2.7, x: 95, y: 35, duration: 23, delay: 0.7 },
  { id: 10, size: 3.0, x: 10, y: 70, duration: 18, delay: 1.8 },
  { id: 11, size: 1.6, x: 20, y: 85, duration: 24, delay: 2.2 },
  { id: 12, size: 2.4, x: 30, y: 55, duration: 14, delay: 0.4 },
  { id: 13, size: 3.3, x: 40, y: 90, duration: 20, delay: 1.3 },
  { id: 14, size: 2.1, x: 50, y: 40, duration: 22, delay: 2.8 },
  { id: 15, size: 1.7, x: 60, y: 65, duration: 17, delay: 0.6 },
  { id: 16, size: 2.9, x: 70, y: 80, duration: 19, delay: 1.7 },
  { id: 17, size: 2.3, x: 80, y: 5, duration: 21, delay: 2.4 },
  { id: 18, size: 1.4, x: 90, y: 95, duration: 16, delay: 0.9 },
  { id: 19, size: 3.1, x: 8, y: 42, duration: 23, delay: 1.1 },
  { id: 20, size: 2.6, x: 18, y: 58, duration: 15, delay: 2.6 },
  { id: 21, size: 1.3, x: 28, y: 78, duration: 25, delay: 0.2 },
  { id: 22, size: 3.4, x: 38, y: 22, duration: 18, delay: 1.4 },
  { id: 23, size: 2.0, x: 48, y: 88, duration: 20, delay: 2.9 },
  { id: 24, size: 1.8, x: 58, y: 12, duration: 22, delay: 0.1 },
  { id: 25, size: 2.5, x: 68, y: 48, duration: 17, delay: 1.6 },
  { id: 26, size: 3.0, x: 78, y: 68, duration: 19, delay: 2.3 },
  { id: 27, size: 1.6, x: 88, y: 28, duration: 21, delay: 0.5 },
  { id: 28, size: 2.8, x: 98, y: 82, duration: 14, delay: 1.9 },
  { id: 29, size: 2.2, x: 3, y: 52, duration: 24, delay: 2.7 },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scrollToFormations = () => {
    const element = document.getElementById("formations");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Animated network/constellation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initNodes = () => {
      nodes = [];
      const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000);
      for (let i = 0; i < Math.min(nodeCount, 50); i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 200, 150, 0.3)";
        ctx.fill();

        // Draw connections
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 200, 150, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initNodes();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initNodes();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900" />

      {/* Animated canvas network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60 pointer-events-none"
      />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-700/50 rounded-full blur-[80px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {fixedParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-teal-400/40 animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/50" />

      {/* Floating course icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {courseIcons.map((course) => (
          <div
            key={course.id}
            className={`absolute ${course.position} ${course.size} animate-float-icon group`}
            style={{ animationDelay: course.delay }}
          >
            <div className="relative w-full h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-teal-500/20 blur-xl animate-pulse-slow" />
              {/* Icon container */}
              <div className="relative w-full h-full rounded-2xl bg-navy-700/80 backdrop-blur-sm border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
                {course.icon}
              </div>
              {/* Label tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-navy-800/90 border border-teal-500/20 text-xs text-teal-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {course.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Animated progress rings - representing growth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {/* Large orbit ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="190"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="1"
              strokeDasharray="20 10"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C896" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#00C896" stopOpacity="0" />
                <stop offset="100%" stopColor="#00C896" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Medium orbit ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <svg className="w-full h-full animate-spin-reverse" viewBox="0 0 300 300">
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1"
              strokeDasharray="15 8"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C896" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00C896" stopOpacity="0" />
                <stop offset="100%" stopColor="#00C896" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-10 animate-fade-in-up">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-navy-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-navy-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-navy-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
          </div>
          <span className="text-sm text-text-muted">
            <span className="text-teal-400 font-semibold">500+</span> professionnels formes
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] mb-8 animate-fade-in-up stagger-2">
          Maitrisez
          <br />
          <span className="relative inline-block mt-2">
            <span className="gradient-text">Power BI</span>
            {/* Animated underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-teal-500/30"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q50,0 100,8 T200,8"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-draw-line"
              />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-3 leading-relaxed">
          Creez des{" "}
          <span className="text-text-secondary">tableaux de bord interactifs</span>,{" "}
          analysez vos{" "}
          <span className="text-text-secondary">donnees</span> et prenez des{" "}
          <span className="text-text-secondary">decisions eclairees</span>.
          <br className="hidden sm:block" />
          Formation pratique en presentiel ou a distance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
          <Button size="lg" onClick={scrollToFormations} className="group">
            S&apos;inscrire maintenant
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
          <button
            onClick={() =>
              document
                .getElementById("why-us")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-teal-500/50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            En savoir plus
          </button>
        </div>

        {/* Feature pills - Power BI focused */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up stagger-5">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              text: "Dashboards interactifs",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              text: "DAX & Power Query",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              text: "Projets pratiques",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
              text: "Certification",
            },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-700/50 border border-white/5 text-sm text-text-muted hover:border-teal-500/30 hover:text-teal-400 transition-all cursor-default group"
            >
              <span className="text-teal-500 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
