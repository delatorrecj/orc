
import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded bg-black shadow shadow-primary/20">
                                <Image
                                    src="/orc.png"
                                    alt="ORC Logo"
                                    fill
                                    className="object-contain p-0.5"
                                />
                            </div>
                            <span className="font-bold text-white">ORC</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Autonomous supply chain orchestration for the viability economy.
                        </p>
                    </div>

                    {/* Columns */}
                    {/* Columns */}
                    <div className="col-span-1 space-y-4">
                        <h4 className="text-white font-bold text-sm">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/mission" className="hover:text-primary transition-colors">Mission</Link></li>
                            <li><Link href="/trust" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
                            <li><Link href="/strategy" className="hover:text-primary transition-colors">Strategy</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <h4 className="text-white font-bold text-sm">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors cursor-not-allowed opacity-50">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors cursor-not-allowed opacity-50">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-600">
                    <p>© 2026 ORC. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span>SYSTEM: <span className="text-success">ONLINE</span></span>
                        <span>REGION: GLOBAL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
