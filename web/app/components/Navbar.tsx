"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-primary/20 bg-black border border-white/10">
                        <Image
                            src="/orc.png"
                            alt="ORC Logo"
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                    <span className="font-bold tracking-tight text-white group-hover:text-primary transition-colors">ORC</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <NavLink href="/strategy" label="Strategy" active={isActive("/strategy")} />
                    <NavLink href="/trust" label="Trust" active={isActive("/trust")} />
                    <NavLink href="/mission" label="Mission" active={isActive("/mission")} />
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/app"
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all hover:scale-105"
                    >
                        Launch ORC <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, active }: { href: string, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`relative transition-colors ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
        >
            {label}
            {active && <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary animate-pulse" />}
        </Link>
    )
}
