import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '@/contexts/WalletContext';
import {
  FileText,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';

const stats = [
  { label: 'Total Volume', value: '$12.4M', change: '+24%', icon: DollarSign },
  { label: 'Active Invoices', value: '2,847', change: '+12%', icon: FileText },
  { label: 'Verified MNCs', value: '156', change: '+8%', icon: CheckCircle2 },
  { label: 'Active Investors', value: '1,234', change: '+32%', icon: Users },
];

const roleCards = [
  {
    title: 'SME Dashboard',
    description: 'Upload invoices, track verification status, and receive funding',
    icon: FileText,
    path: '/sme',
    color: 'bg-info/10 text-info',
    features: ['Upload PDF invoices', 'Arweave storage', 'Real-time status'],
  },
  {
    title: 'MNC Verifications',
    description: 'Review and sign invoices using EIP-712 typed data signatures',
    icon: CheckCircle2,
    path: '/mnc',
    color: 'bg-warning/10 text-warning',
    features: ['Pending queue', 'EIP-712 preview', 'Batch signing'],
  },
  {
    title: 'Investor Portfolio',
    description: 'Browse verified NFTs, fund invoices, and track your returns',
    icon: Briefcase,
    path: '/investor',
    color: 'bg-success/10 text-success',
    features: ['NFT marketplace', 'Risk scoring', 'APY tracking'],
  },
];

const recentActivity = [
  { type: 'funded', desc: 'Invoice #1234 funded for $25,000', time: '2 min ago' },
  { type: 'signed', desc: 'MNC verified invoice #5678', time: '15 min ago' },
  { type: 'minted', desc: 'NFT minted for invoice #9012', time: '1 hour ago' },
  { type: 'settled', desc: 'Invoice #3456 settled with 14.5% APY', time: '3 hours ago' },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletContext();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Vanguard</h1>
          <p className="text-muted-foreground">
            Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)} •{' '}
            Balance: {wallet.balance} MATIC
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} variant="stat">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <span className="text-xs font-medium text-success">{stat.change}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Selection */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Choose Your Role</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {roleCards.map((role) => (
              <Card
                key={role.title}
                variant="interactive"
                className="group cursor-pointer"
                onClick={() => navigate(role.path)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <role.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Recent Platform Activity
                </CardTitle>
                <CardDescription>Live updates from the Vanguard network</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${activity.type === 'funded'
                          ? 'bg-success'
                          : activity.type === 'signed'
                            ? 'bg-info'
                            : activity.type === 'minted'
                              ? 'bg-accent'
                              : 'bg-primary'
                        }`}
                    />
                    <span className="text-sm text-foreground">{activity.desc}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                USDC Flow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total USDC Locked</span>
                  <span className="font-semibold text-foreground">$8,234,567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interest Reserves</span>
                  <span className="font-semibold text-success">$432,100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Settlement Time</span>
                  <span className="font-semibold text-foreground">32 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Network Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-semibold text-accent">Shardeum Sphinx</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chain ID</span>
                  <span className="font-mono text-foreground">8119</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-success font-medium">Active</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
