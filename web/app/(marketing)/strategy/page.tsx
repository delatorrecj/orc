import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, DollarSign, Zap, Globe, Cpu } from "lucide-react";

export default function StrategyPage() {
    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-background text-foreground">
            {/* Ambience */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <main className="z-10 max-w-7xl w-full px-6 py-24 space-y-16">
                {/* Nav Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Return to Orbit
                </Link>

                {/* Header */}
                <section className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono tracking-wide">
                        <TrendingUp className="w-3 h-3" />
                        STRATEGY_BLUEPRINT
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white font-brand">
                        The Blueprint.
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        How ORC captures value in the $20B Supply Chain Software market.
                        <br />
                        <span className="text-sm font-mono text-gray-500">Target Audience: Enterprise Procurement & Logistics Leaders</span>
                    </p>
                </section>

                {/* The Canvas Grid - 3x2 Layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Key Partners */}
                    <CanvasCard
                        title="Key Partners"
                        subtitle="The 'Network'"
                        icon={<Globe className="w-5 h-5 text-blue-400" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-blue-400">●</span> <strong className="text-white">Google Cloud / DeepMind:</strong> Provider of the "Brain" (Gemini Models).</li>
                            <li className="flex gap-2"><span className="text-blue-400">●</span> <strong className="text-white">ERP Giants:</strong> Integration targets (SAP/Oracle).</li>
                            <li className="flex gap-2"><span className="text-blue-400">●</span> <strong className="text-white">Logistics Firms:</strong> FedEx/DHL Data Feeds.</li>
                        </ul>
                    </CanvasCard>

                    {/* Key Activities */}
                    <CanvasCard
                        title="Key Activities"
                        subtitle="The 'Work'"
                        icon={<Cpu className="w-5 h-5 text-purple-400" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-purple-400">●</span> <strong className="text-white">R&D:</strong> Continuous 'Gatekeeper' training on new layouts.</li>
                            <li className="flex gap-2"><span className="text-purple-400">●</span> <strong className="text-white">Security:</strong> ISO 27001 & AI Safety maintenance.</li>
                            <li className="flex gap-2"><span className="text-purple-400">●</span> <strong className="text-white">Orchestration:</strong> Maintaining legacy ERP connectors.</li>
                        </ul>
                    </CanvasCard>

                    {/* Value Props */}
                    <CanvasCard
                        title="Value Propositions"
                        subtitle="The 'Why'"
                        icon={<Zap className="w-5 h-5 text-warning" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-warning">●</span> <strong className="text-white">Touchless Intake:</strong> Turn chaos (PDFs) into order (JSON) instantly.</li>
                            <li className="flex gap-2"><span className="text-warning">●</span> <strong className="text-white">The Guardian:</strong> AI that protects (Fraud/Bias checks).</li>
                            <li className="flex gap-2"><span className="text-warning">●</span> <strong className="text-white">Speed to Value:</strong> Deploy in days, not months.</li>
                        </ul>
                    </CanvasCard>

                    {/* Customer Segments */}
                    <CanvasCard
                        title="Customer Segments"
                        subtitle="The 'Who'"
                        icon={<Users className="w-5 h-5 text-primary" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-primary">●</span> <strong className="text-white">Primary:</strong> Enterprise CPOs (&gt;10k invoices/mo).</li>
                            <li className="flex gap-2"><span className="text-primary">●</span> <strong className="text-white">Secondary:</strong> Logistics Managers drowning in paperwork.</li>
                            <li className="flex gap-2"><span className="text-primary">●</span> <strong className="text-white">Tertiary:</strong> Audit Firms (Big 4) needing clean data.</li>
                        </ul>
                    </CanvasCard>

                    {/* Revenue Streams */}
                    <CanvasCard
                        title="Revenue Streams"
                        subtitle="The 'How'"
                        icon={<DollarSign className="w-5 h-5 text-success" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-success">●</span> <strong className="text-white">Tiered SaaS:</strong> Startups ($500) to Enterprise ($5k/mo).</li>
                            <li className="flex gap-2"><span className="text-success">●</span> <strong className="text-white">Volume-Based:</strong> Per-document orchestration fee.</li>
                            <li className="flex gap-2"><span className="text-success">●</span> <strong className="text-white">Audit Fee:</strong> Premium for 'Guardian' compliance checks.</li>
                        </ul>
                    </CanvasCard>

                    {/* Cost Structure */}
                    <CanvasCard
                        title="Cost Structure"
                        subtitle="The 'Lean'"
                        icon={<TrendingUp className="w-5 h-5 text-red-400" />}
                    >
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex gap-2"><span className="text-red-400">●</span> <strong className="text-white">Infrastructure:</strong> Gemini Token usage & Cloud Hosting.</li>
                            <li className="flex gap-2"><span className="text-red-400">●</span> <strong className="text-white">R&D:</strong> Engineering & Design team costs.</li>
                            <li className="flex gap-2"><span className="text-red-400">●</span> <strong className="text-white">OpEx:</strong> Minimal headcount via Agent automation.</li>
                        </ul>
                    </CanvasCard>
                </div>

                {/* Structured Data Script (SEO) */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BusinessModel",
                        "name": "ORC Business Strategy",
                        "description": "Touchless Supply Chain Orchestration SaaS",
                        "targetAudience": "Enterprise Procurement",
                        "revenueModel": "Tiered SaaS Subscription",
                        "uniqueSellingProposition": "AI-First Compliance & Intake"
                    })
                }} />
            </main>
        </div>
    );
}

function CanvasCard({ title, subtitle, icon, children }: { title: string, subtitle: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="p-6 rounded-xl glass-panel hover:border-primary/30 transition-colors h-full flex flex-col hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">{title}</h3>
                {icon}
            </div>
            <p className="text-xs text-gray-500 font-mono mb-4 uppercase tracking-wider">{subtitle}</p>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
