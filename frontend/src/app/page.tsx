"use client";

import Link from "next/link";
import { Github, ArrowRight, Shield, Code, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/Landing/FeatureCard";
import { HeroMockup } from "@/components/Landing/HeroMockup";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = async () => {
    // if (session) {
    // console.log(session)
    // router.push("/dashboard");
    // } else {
    await signIn("github", { callbackUrl: "/dashboard" });
    // }
  };
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">RefactorAI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="/dashboard" className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-gradient">
            Your codebase. Understood.
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            RefactorAI deep-scans your GitHub repositories to uncover architectural flaws,
            technical debt, and complex code patterns using state-of-the-art AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignIn}
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2 text-lg"
            >
              <Github className="w-5 h-5" /> Sign in with GitHub
            </button>
          </div>
        </motion.div>

        <HeroMockup />
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 border-t border-white/5 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Powerful Analysis Engine</h2>
            <p className="text-zinc-400">Everything you need to maintain a healthy codebase.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Architecture Mapping"
              description="Visualize how your components and services interact across the entire codebase."
            />
            <FeatureCard
              title="Technical Debt"
              description="Quantify maintenance overhead and identify areas requiring immediate attention."
            />
            <FeatureCard
              title="Pattern Detection"
              description="Automated detection of complex code patterns and potential architectural leaks."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-zinc-500 text-sm flex justify-between items-center text-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">RefactorAI</span>
        </div>
        <p>&copy; 2024 RefactorAI Inc. Built for developers.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

