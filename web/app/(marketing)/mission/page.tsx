import Link from "next/link";
import { ArrowLeft, Users, BrainCircuit, Rocket, ShieldCheck } from "lucide-react";

export default function MissionPage() {
    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-background text-foreground">
            {/* Ambience */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <main className="z-10 max-w-5xl w-full px-6 py-24 space-y-20">
                {/* Nav Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Return to Orbit
                </Link>

                {/* Hero */}
                <section className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono tracking-wide">
                        <Users className="w-3 h-3" />
                        MISSION_LOG_001
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white font-brand">
                        One Human. <br />
                        <span className="text-primary">Fifty Agents.</span>
                    </h1>

                    <p className="text-2xl font-light text-gray-300 max-w-3xl leading-relaxed">
                        Redefining the "Enterprise Team" in the Age of AI.
                    </p>
                </section>

                {/* The Narrative Grid */}
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6 text-lg text-gray-400 leading-relaxed font-light">
                        <p>
                            <strong className="text-white font-medium">The Old Way:</strong> Traditional supply chain software requires armies of engineers, months of onboarding, and six-figure implementations. It thrives on complexity.
                        </p>
                        <p>
                            <strong className="text-white font-medium">The ORC Way:</strong> We proved that a single architect, equipped with <span className="text-primary">Google Antigravity</span>, can build systems that rival legacy enterprise tools.
                        </p>
                        <p>
                            I built ORC to solve the <span className="text-white italic">"Intake Problem"</span>—the manual friction that slows down global trade. By utilizing Gemini 2.5 Flash, created a system that is 10x faster, 100x cheaper, and infinitely more scalable.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <StatCard
                            icon={<BrainCircuit className="w-5 h-5 text-primary" />}
                            value="50+"
                            label="Active AI Agents"
                        />
                        <StatCard
                            icon={<Rocket className="w-5 h-5 text-success" />}
                            value="10x"
                            label="Velocity vs. Legacy Teams"
                        />
                        <StatCard
                            icon={<ShieldCheck className="w-5 h-5 text-warning" />}
                            value="100%"
                            label="Glass Box Transparency"
                        />
                    </div>
                </div>

                {/* Quote */}
                <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-2xl text-white/80 font-serif">
                    "We don't need more people to solve complexity. We need better orchestration."
                </blockquote>
            </main>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center border border-white/10">
                {icon}
            </div>
            <div>
                <div className="text-3xl font-bold text-white font-brand">{value}</div>
                <div className="text-sm text-gray-400 font-mono uppercase tracking-wide">{label}</div>
            </div>
        </div>
    );
}
