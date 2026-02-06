import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Scale, Eye } from "lucide-react";

export default function TrustPage() {
    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-background text-foreground">
            {/* Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-success/5 blur-[150px] rounded-full pointer-events-none" />

            <main className="z-10 max-w-6xl w-full px-6 py-24 space-y-20">
                {/* Nav Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Return to Orbit
                </Link>

                {/* Hero */}
                <section className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-mono tracking-wide">
                        <ShieldCheck className="w-3 h-3" />
                        TRUST_CORE_ACTIVE
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-brand">
                        Safety First. <br />
                        <span className="text-success">Intelligence Second.</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We don't just read the Google AI Principles. <br />
                        <span className="text-white">We coded them into the kernel.</span>
                    </p>
                </section>

                {/* The Guardian Protocol */}
                <div className="grid md:grid-cols-3 gap-8">
                    <TrustCard
                        title="Privacy"
                        icon={<Lock className="w-6 h-6 text-blue-400" />}
                        desc="PII Redaction on the edge. Sensitive data never leaves your secure enclave without explicit redaction."
                    />
                    <TrustCard
                        title="Fairness"
                        icon={<Scale className="w-6 h-6 text-purple-400" />}
                        desc="Bias-checked vendor scoring. Our algorithms are audited to ensure fair treatment of all supplier tiers."
                    />
                    <TrustCard
                        title="Accountability"
                        icon={<Eye className="w-6 h-6 text-warning" />}
                        desc="Glass Box methodology. Every AI decision, flag, or extraction comes with a 'Why' trace."
                    />
                </div>

                {/* Principles Data */}
                <div className="p-8 rounded-2xl glass-panel border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6 font-mono">CORE_DIRECTIVES // GOOGLE_AI_ALIGNMENT</h3>
                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">01. Socially Beneficial</span>
                            <span className="text-success">COMPLIANT</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">02. Avoid creating unfair bias</span>
                            <span className="text-success">COMPLIANT</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">03. Built for Safety</span>
                            <span className="text-success">COMPLIANT</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">04. Accountable to people</span>
                            <span className="text-success">COMPLIANT</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function TrustCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-xl glass-panel hover:border-success/30 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    );
}
