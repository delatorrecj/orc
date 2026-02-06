"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Mail, BrainCircuit } from "lucide-react";
import { MagicBento } from "../components/MagicBento";

export default function Home() {

  const features = [
    {
      title: "Zero-Friction Intake",
      description: "Suppliers just email us. We handle the rest.",
      icon: <Mail className="w-8 h-8 text-primary" />,
      colSpan: 1
    },
    {
      title: "Agentic Extraction",
      description: "Gemini 2.5 reads messy PDFs with human-level accuracy.",
      icon: <BrainCircuit className="w-8 h-8 text-warning" />,
      colSpan: 1
    },
    {
      title: "Guardian Verified",
      description: "Automated audit checks against industry benchmarks.",
      icon: <ShieldCheck className="w-8 h-8 text-success" />,
      colSpan: 1
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="z-10 max-w-6xl w-full px-6 text-center space-y-16 mt-20 mb-20">

        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-warning text-sm font-mono tracking-wide animate-pulse">
            <span className="w-2 h-2 bg-warning rounded-full" />
            VIABILITY CRISIS DETECTED
          </div>

          <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white drop-shadow-lg font-brand">
            ORC
          </h1>

          <p className="text-2xl md:text-3xl font-light text-white max-w-3xl mx-auto">
            Your Supply Chain. <span className="text-primary font-semibold">Orchestrated.</span>
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed pt-4">
            Decouple the complexity of global trade from human effort.
            <br />
            Transform chaotic intake into <span className="text-secondary font-mono">structured, compliant order</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/app"
            className="group relative px-8 py-4 bg-primary text-white font-bold rounded-lg overflow-hidden transition-all hover:scale-105 hover:primary-glow"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              Launch ORC <ArrowRight className="w-5 h-5" />
            </span>
          </Link>

          <Link
            href="/mission"
            className="px-6 py-4 glass-panel text-gray-300 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/20"
          >
            Our Mission
          </Link>
        </div>

        {/* Feature Grid via MagicBento */}
        <div className="pt-8">
          <MagicBento cards={features} />
        </div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-gray-500 text-sm font-mono w-full text-center">
        SYSTEM_STATUS: <span className="text-green-500">ONLINE</span> | GEN_AI_MODEL: GEMINI_2.5_FLASH
      </footer>
    </div>
  );
}
