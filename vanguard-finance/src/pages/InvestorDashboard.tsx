import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { NFTCard, Invoice } from '@/types/vanguard';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  Loader2,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWalletContext } from '@/contexts/WalletContext';
import { ethers } from 'ethers';

const API_URL = 'https://vanguard-backend-ftbf.onrender.com';
const CONTRACT_ADDRESS = "0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8";
const CHAIN_ID = 8119; // Shardeum Sphinx

const INVOICE_MANAGER_ABI = [
  "function invest(uint256 _tokenId) external",
  "function usdcToken() view returns (address)",
  "function invoices(uint256) view returns (address sme, address mnc, uint256 principal, uint256 repaymentAmount, string arweaveHash, uint8 status, uint256 launchTime)",
  "error NotVerified()",
  "error TransferFailed()",
  "error AlreadyFunded()",
  "error InvalidStatus()"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount) external"
];

export const InvestorDashboard: React.FC = () => {
  const { wallet } = useWalletContext();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingNft, setFundingNft] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [isMinting, setIsMinting] = useState(false);

  const fetchUsdcBalance = async () => {
    if (!wallet.address || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const managerContract = new ethers.Contract(CONTRACT_ADDRESS, ["function usdcToken() view returns (address)"], provider);
      const usdcAddress = await managerContract.usdcToken();
      const usdcContract = new ethers.Contract(usdcAddress, ["function balanceOf(address) view returns (uint256)"], provider);
      const balance = await usdcContract.balanceOf(wallet.address);
      setUsdcBalance(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invoices`);
      const data = await response.json();
      if (data.success) {
        // Filter for Verified (Ready to Fund) or Funded (History)
        const visibleInvoices = data.invoices.filter((inv: any) => {
          const status = inv.status.toLowerCase();
          return status === 'verified' || status === 'funded' || status === 'settled';
        }).map((inv: any) => {
          // Normalize status to Title Case
          const status = inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase();
          return {
            ...inv,
            status,
            // Map Invoice to NFT Card format
            invoiceId: `INV-${inv.tokenId}`,
            value: Number(inv.amount),
            riskScore: 10, // Mock score
            estimatedApy: 12.5, // Mock APY
            timeFactor: 1.0
          };
        });
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
    fetchUsdcBalance();
    const interval = setInterval(() => {
      fetchInvoices();
      fetchUsdcBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [wallet.address]);

  const totalInvested = nfts.filter(n => n.status === 'Funded').reduce((sum, n) => sum + n.value, 0);
  const totalReturns = totalInvested * 0.12; // Mock return
  const activeInvestments = nfts.filter((n) => n.status === 'Funded').length;
  const avgApy = 12.5;

  const getRiskColor = (score: number) => {
    if (score <= 15) return 'text-success';
    if (score <= 25) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 15) return 'Low';
    if (score <= 25) return 'Medium';
    return 'High';
  };

  const handleFund = async (tokenId: number) => {
    if (!wallet.address) {
      toast({ title: "Connect Wallet", description: "Please connect wallet first", variant: "destructive" });
      return;
    }

    setFundingNft(tokenId);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // 1. Check and switch network to Shardeum if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${CHAIN_ID.toString(16)}`;

      if (currentChainId !== targetChainId) {
        toast({ title: 'Switching Network', description: 'Please approve the network switch in MetaMask' });
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Shardeum Sphinx',
                nativeCurrency: { name: 'Shardeum', symbol: 'SHM', decimals: 18 },
                rpcUrls: ['https://api-mezame.shardeum.org/'],
                blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Setup Ethers
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const managerContract = new ethers.Contract(CONTRACT_ADDRESS, INVOICE_MANAGER_ABI, signer);
      const usdcAddress = await managerContract.usdcToken();
      const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, signer);

      // Get invoice details for amount
      const invoiceData = await managerContract.invoices(tokenId);
      const amount = invoiceData.principal;

      toast({ title: 'Approving USDC', description: 'Please approve USDC spending in MetaMask' });

      // 2. Approve USDC
      const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, amount);
      await approveTx.wait();

      toast({ title: 'Processing Investment', description: 'Please confirm the investment in MetaMask' });

      // 3. Invest (Add gas limit to avoid estimation issues on Shardeum)
      const investTx = await managerContract.invest(tokenId, {
        gasLimit: 500000
      });
      await investTx.wait();

      toast({ title: 'Investment Successful!', description: `Transaction: ${investTx.hash.slice(0, 10)}...` });

      // 4. Update backend DB
      await fetch(`${API_URL}/api/investor/confirm-investment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenId,
          txHash: investTx.hash
        })
      });

      // Refresh data
      fetchInvoices();
      fetchUsdcBalance();

    } catch (err: any) {
      console.error('Funding error:', err);

      let errorMessage = err.message || 'Failed to fund invoice. Please try again.';

      // Try to parse revert reason if available (ethers v6)
      if (err.info?.error?.message) {
        errorMessage = err.info.error.message;
      } else if (err.reason) {
        errorMessage = err.reason;
      }

      toast({
        title: 'Investment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setFundingNft(null);
    }
  };

  const handleMintUSDC = async () => {
    if (!wallet.address || !window.ethereum) return;
    setIsMinting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const managerContract = new ethers.Contract(CONTRACT_ADDRESS, ["function usdcToken() view returns (address)"], signer);
      const usdcAddress = await managerContract.usdcToken();
      const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, signer);

      toast({ title: "Minting Mock USDC", description: "Please confirm in MetaMask" });
      const tx = await usdcContract.mint(wallet.address, ethers.parseUnits("5000", 6));
      await tx.wait();
      toast({ title: "Success!", description: "Minted 5000 Mock USDC" });
      fetchUsdcBalance();
    } catch (error: any) {
      console.error("Minting error:", error);
      toast({ title: "Minting Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Investor Portfolio</h1>
            <p className="text-muted-foreground">
              Browse verified invoice NFTs and fund opportunities
            </p>
          </div>
          <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Your USDC Balance</p>
              <p className="text-xl font-bold text-primary">{Number(usdcBalance).toLocaleString()} USDC</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10"
              onClick={handleMintUSDC}
              disabled={isMinting}
            >
              {isMinting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mint 5k"}
            </Button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${totalInvested.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Returns</p>
                  <p className="text-2xl font-bold text-success">
                    +${totalReturns.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                  <p className="text-2xl font-bold text-foreground">{activeInvestments}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. APY</p>
                  <p className="text-2xl font-bold text-accent">{avgApy}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Marketplace */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Verified Invoice NFTs</h2>
              <p className="text-sm text-muted-foreground">
                Fund invoices and earn yields on verified receivables
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              Time Factor bonus active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <div className="col-span-3 text-center p-8"><Loader2 className="animate-spin inline" /></div> :
              nfts.map((nft) => (
                <Card
                  key={nft.tokenId}
                  variant="interactive"
                  className={nft.status === 'funded' ? 'opacity-75' : ''}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{nft.tokenId}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{nft.invoiceId}</CardTitle>
                          <CardDescription>Token ID: {nft.tokenId}</CardDescription>
                        </div>
                      </div>
                      <StatusBadge status={nft.status.toLowerCase()} size="sm" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Value */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-1">Invoice Value</div>
                      <div className="text-2xl font-bold text-foreground">
                        ${nft.value.toLocaleString()}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className={`w-4 h-4 ${getRiskColor(nft.riskScore)}`} />
                        </div>
                        <div className={`text-lg font-bold ${getRiskColor(nft.riskScore)}`}>
                          {nft.riskScore}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getRiskLabel(nft.riskScore)} Risk
                        </div>
                      </div>

                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <div className="text-lg font-bold text-success">{nft.estimatedApy}%</div>
                        <div className="text-xs text-muted-foreground">Est. APY</div>
                      </div>

                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-accent" />
                        </div>
                        <div className="text-lg font-bold text-accent">{nft.timeFactor}x</div>
                        <div className="text-xs text-muted-foreground">Time Factor</div>
                      </div>
                    </div>

                    {/* Arweave Hash */}
                    <HashDisplay hash={nft.arweaveHash} label="Arweave Hash" />

                    {/* Fund Section */}
                    {(nft.status === 'Verified' || nft.status === 'Minted') && (
                      <div className="pt-2 space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1 text-center py-2 text-sm text-muted-foreground bg-muted/30 rounded">
                            Required: {nft.value} USDC
                          </div>
                          <Button
                            variant="success"
                            onClick={() => handleFund(nft.tokenId)}
                            disabled={fundingNft === nft.tokenId}
                            className="min-w-[120px]"
                          >
                            {fundingNft === nft.tokenId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4" />
                                Fund Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {nft.status === 'Funded' && (
                      <div className="pt-2">
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
                          <p className="text-sm font-medium text-success">Already Funded</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
