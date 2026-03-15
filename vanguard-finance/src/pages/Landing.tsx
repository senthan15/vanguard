import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConnectWalletModal } from '@/components/ConnectWalletModal';
import { useWalletContext } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  FileText,
  Coins,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Tokenized Invoices',
    description: 'Convert verified invoices into tradeable NFTs backed by real receivables.',
  },
  {
    icon: Shield,
    title: 'MNC Verification',
    description: 'Multi-national corporations verify invoices using EIP-712 signatures.',
  },
  {
    icon: Coins,
    title: 'USDC Stability',
    description: '4-stage volatility guard ensures no ETH price exposure for investors.',
  },
  {
    icon: BarChart3,
    title: 'Transparent APY',
    description: 'Real-time risk scoring and estimated returns for every invoice NFT.',
  },
];

const stats = [
  { value: '$12M+', label: 'Total Volume' },
  { value: '2,400+', label: 'Invoices Funded' },
  { value: '98.5%', label: 'Settlement Rate' },
  { value: '15.2%', label: 'Avg. APY' },
];

export const Landing: React.FC = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { wallet } = useWalletContext();
  const navigate = useNavigate();

  /* 
  React.useEffect(() => {
    if (wallet.isConnected) {
      navigate('/sme');
    }
  }, [wallet.isConnected, navigate]);
  */

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-primary-foreground">Vanguard</span>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={() => setShowConnectModal(true)}
          >
            Connect Wallet
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Built on Shardeum</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
            Invoice Funding,
            <br />
            <span className="text-accent">Reimagined</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The institutional-grade DeFi platform for tokenized invoice financing.
            SMEs get instant liquidity, investors earn stable yields.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => setShowConnectModal(true)}
              className="group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-primary-foreground/10 bg-primary-foreground/5">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              How Vanguard Works
            </h2>
            <p className="text-primary-foreground/60 max-w-2xl mx-auto">
              A complete ecosystem connecting SMEs, multi-national corporations, and institutional investors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-foreground/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-primary-foreground/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-12">
            The 4-Stage USDC Flow
          </h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Entry', desc: 'Investor deposits ETH/USDC → Contract locks value as USDC' },
              { step: 2, title: 'Funding', desc: 'NFT funded → USDC principal sent directly to SME wallet' },
              { step: 3, title: 'Settlement', desc: 'MNC repays debt → Contract converts back to USDC' },
              { step: 4, title: 'Exit', desc: 'Investors withdraw USDC principal + earned interest' },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-6 p-6 rounded-xl bg-primary/50 border border-primary-foreground/10"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-foreground font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-lg">{item.title}</h3>
                  <p className="text-primary-foreground/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-12">
            Built for Every Stakeholder
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'SMEs',
                items: ['Upload invoices', 'Get instant liquidity', 'Track funding status'],
              },
              {
                icon: CheckCircle2,
                title: 'MNCs',
                items: ['Verify invoices', 'EIP-712 signatures', 'Manage approvals'],
              },
              {
                icon: Users,
                title: 'Investors',
                items: ['Browse NFT marketplace', 'Earn stable yields', 'Real-time APY'],
              },
            ].map((role) => (
              <div
                key={role.title}
                className="p-8 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <role.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary-foreground mb-4">{role.title}</h3>
                <ul className="space-y-2">
                  {role.items.map((item) => (
                    <li key={item} className="text-primary-foreground/60 text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="p-12 rounded-2xl bg-accent/10 border border-accent/20">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Transform Invoice Financing?
            </h2>
            <p className="text-primary-foreground/60 mb-8">
              Connect your wallet and join the future of DeFi invoice funding on Polygon.
            </p>
            <Button
              variant="hero"
              size="xl"
              onClick={() => setShowConnectModal(true)}
              className="animate-pulse-glow"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-primary-foreground/10">
        <div className="container mx-auto text-center text-sm text-primary-foreground/40">
          © 2024 Vanguard. Built on Polygon Amoy Testnet.
        </div>
      </footer>

      <ConnectWalletModal open={showConnectModal} onOpenChange={setShowConnectModal} />
    </div>
  );
};
