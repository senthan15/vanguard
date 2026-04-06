import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { NFTCard } from '@/types/vanguard';
import {
  Search,
  Filter,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWalletContext } from '@/contexts/WalletContext';

const API_URL = 'https://vanguard-backend-ftbf.onrender.com';

export const Marketplace: React.FC = () => {
  const { wallet } = useWalletContext();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fundingNft, setFundingNft] = useState<number | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invoices`);
      const data = await response.json();
      if (data.success) {
        // Filter for Verified/Funded/Settled
        const visibleInvoices = data.invoices.filter((inv: any) =>
          ['Verified', 'Funded', 'Settled'].includes(inv.status)
        ).map((inv: any) => ({
          ...inv,
          invoiceId: `INV-${inv.tokenId}`,
          value: Number(inv.amount),
          riskScore: 10,
          estimatedApy: 12.5,
          timeFactor: 1.0,
          status: inv.status === 'Verified' ? 'minted' : inv.status.toLowerCase() // Map 'Verified' to 'minted' for UI if needed, or just keep Verified
        }));
        setNfts(visibleInvoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalAvailable = nfts.filter((n) => n.status === 'minted' || n.status === 'Verified').length;
  const totalValue = nfts.reduce((sum, n) => sum + n.value, 0);
  const avgApy = 12.5;

  const filteredNfts = nfts.filter(
    (nft) =>
      nft.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (nft.arweaveHash && nft.arweaveHash.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRiskColor = (score: number) => {
    if (score <= 15) return 'text-success';
    if (score <= 25) return 'text-warning';
    return 'text-destructive';
  };

  const handleFund = async (tokenId: number) => {
    if (!wallet.address) {
      toast({ title: "Connect Wallet", description: "Please connect wallet first", variant: "destructive" });
      return;
    }

    setFundingNft(tokenId);

    try {
      const res = await fetch(`${API_URL}/api/investor/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: tokenId })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Investment Successful!',
        description: `You funded the invoice.`,
      });
      fetchInvoices();
    } catch (err: any) {
      toast({ title: "Investment Failed", description: err.message, variant: "destructive" });
    } finally {
      setFundingNft(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">NFT Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and fund verified invoice NFTs
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 p-6 rounded-xl bg-muted/30 border">
          <div>
            <p className="text-sm text-muted-foreground">Available NFTs</p>
            <p className="text-2xl font-bold text-foreground">{totalAvailable}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Avg. APY</p>
            <p className="text-2xl font-bold text-success">{avgApy}%</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Invoice ID or Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* NFT Grid/List */}
        {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin inline" /></div> :
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNfts.map((nft) => (
                <Card
                  key={nft.tokenId}
                  variant="interactive"
                  className={nft.status !== 'minted' && nft.status !== 'Verified' ? 'opacity-60' : ''}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{nft.tokenId}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{nft.invoiceId}</CardTitle>
                        </div>
                      </div>
                      <StatusBadge status={nft.status} size="sm" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-1">Value</div>
                      <div className="text-2xl font-bold text-foreground">
                        ${nft.value.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <Shield className={`w-4 h-4 mx-auto mb-1 ${getRiskColor(nft.riskScore)}`} />
                        <div className={`text-sm font-bold ${getRiskColor(nft.riskScore)}`}>
                          {nft.riskScore}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Risk</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-success" />
                        <div className="text-sm font-bold text-success">{nft.estimatedApy}%</div>
                        <div className="text-[10px] text-muted-foreground">APY</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-accent" />
                        <div className="text-sm font-bold text-accent">{nft.timeFactor}x</div>
                        <div className="text-[10px] text-muted-foreground">Factor</div>
                      </div>
                    </div>

                    <HashDisplay hash={nft.arweaveHash} />

                    {(nft.status === 'minted' || nft.status === 'Verified') && (
                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 text-center py-2 text-sm text-muted-foreground bg-muted/30 rounded">
                          Required: {nft.value} USDC
                        </div>
                        <Button
                          variant="success"
                          onClick={() => handleFund(nft.tokenId)}
                          disabled={fundingNft === nft.tokenId}
                        >
                          {fundingNft === nft.tokenId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNfts.map((nft) => (
                <Card
                  key={nft.tokenId}
                  className={`p-4 ${nft.status !== 'minted' && nft.status !== 'Verified' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">#{nft.tokenId}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{nft.invoiceId}</span>
                          <StatusBadge status={nft.status} size="sm" />
                        </div>
                        <p className="text-xl font-bold">${nft.value.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getRiskColor(nft.riskScore)}`}>
                          {nft.riskScore}
                        </p>
                        <p className="text-xs text-muted-foreground">Risk</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-success">{nft.estimatedApy}%</p>
                        <p className="text-xs text-muted-foreground">APY</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent">{nft.timeFactor}x</p>
                        <p className="text-xs text-muted-foreground">Factor</p>
                      </div>
                      <HashDisplay hash={nft.arweaveHash} />
                      {(nft.status === 'minted' || nft.status === 'Verified') && (
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted/30 rounded">
                            {nft.value} USDC
                          </div>
                          <Button
                            variant="success"
                            onClick={() => handleFund(nft.tokenId)}
                            disabled={fundingNft === nft.tokenId}
                          >
                            {fundingNft === nft.tokenId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Fund'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};
