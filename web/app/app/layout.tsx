import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Sidebar - The Comms Panel */}
            <aside className="w-64 border-r border-white/10 bg-surface/30 backdrop-blur-md flex flex-col fixed inset-y-0 z-50">

                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link href="/" className="font-bold tracking-widest text-primary flex items-center gap-3">
                        <div className="relative w-7 h-7 bg-black rounded shadow shadow-primary/20">
                            <Image src="/orc.png" alt="ORC" fill className="object-contain p-0.5" />
                        </div>
                        ORC
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem href="/app" icon={<LayoutDashboard />} label="Command Center" active />
                    <NavItem href="/app/agents" icon={<Users />} label="Agent Status" />
                    <NavItem href="/app/settings" icon={<Settings />} label="Config" />
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            SA
                        </div>
                        <div className="text-xs">
                            <div className="font-bold text-white">SysAdmin</div>
                            <div className="text-gray-500">Online</div>
                        </div>
                    </div>
                    <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-critical transition-colors">
                        <LogOut className="w-4 h-4" /> Disconnect
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen relative">
                {/* Background Grid/Ambience */}
                {/* Background Grid/Ambience */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Nebula Glows */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-success/5 rounded-full blur-[100px]" />

                    {/* Masked Grid */}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"
                        style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }}
                    />
                </div>

                <div className="relative z-10 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02] ${active
                ? "bg-primary/20 text-primary border border-primary/20 shadow-sm shadow-primary/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
        >
            <span className="w-5 h-5">{icon}</span>
            {label}
        </Link>
    )
}
