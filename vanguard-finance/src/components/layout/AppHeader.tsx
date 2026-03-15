import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Store,
    FileText,
    CheckCircle2,
    Briefcase,
    LogOut,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/contexts/WalletContext';

const mainNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Marketplace', url: '/marketplace', icon: Store },
];

const roleNavItems = [
    { title: 'SME', url: '/sme', icon: FileText },
    { title: 'MNC', url: '/mnc', icon: CheckCircle2 },
    { title: 'Investor', url: '/investor', icon: Briefcase },
];

export function AppHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const { wallet, disconnect } = useWalletContext();

    const isActive = (path: string) => location.pathname === path;

    const truncateAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10 text-primary-foreground h-16 shadow-lg">
            <div className="container mx-auto px-6 h-full flex items-center justify-between gap-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <span className="text-accent-foreground font-bold text-sm">V</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Vanguard</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1 flex-1">
                    {mainNavItems.map((item) => (
                        <Button
                            key={item.title}
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(item.url)}
                            className={`gap-2 px-4 h-9 rounded-full transition-all ${isActive(item.url)
                                    ? 'bg-accent text-accent-foreground font-semibold lg:shadow-md'
                                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 font-medium'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Button>
                    ))}

                    <div className="w-px h-6 bg-primary-foreground/10 mx-2" />

                    {roleNavItems.map((item) => (
                        <Button
                            key={item.title}
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(item.url)}
                            className={`gap-2 px-4 h-9 rounded-full transition-all ${isActive(item.url)
                                    ? 'bg-accent text-accent-foreground font-semibold lg:shadow-md'
                                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 font-medium'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Button>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {wallet.isConnected && (
                        <>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/5 border border-primary-foreground/10">
                                <Wallet className="h-4 w-4 text-accent" />
                                <span className="text-xs font-mono text-primary-foreground/90">
                                    {truncateAddress(wallet.address!)}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={disconnect}
                                className="text-primary-foreground/60 hover:text-destructive hover:bg-destructive/10 h-9 px-3 rounded-full gap-2 transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden lg:inline">Disconnect</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
