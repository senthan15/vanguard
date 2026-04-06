import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { Invoice } from '@/types/vanguard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  FileText,
  Shield,
  AlertTriangle,
  Loader2,
  Eye,
  PenLine,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWalletContext } from '@/contexts/WalletContext';

const API_URL = 'https://vanguard-backend-ftbf.onrender.com';
const CONTRACT_ADDRESS = '0x77Cff71640b88b500ca27146BbEF41FaB0F94BD8'; // Hardcoded based on backend .env
const CHAIN_ID = 8119; // Shardeum Sphinx

export const MNCDashboard: React.FC = () => {
  const { wallet } = useWalletContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invoices`);
      const data = await response.json();
      // Filter: Display 'Anchored' Invoices in Pending, 'Verified' in Signed
      if (data.success) {
        setInvoices(data.invoices);
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

  const pendingInvoices = invoices.filter((inv) => inv.status === 'Anchored');
  const signedInvoices = invoices.filter((inv) => inv.status === 'Verified' || inv.status === 'Funded');

  const pendingCount = pendingInvoices.length;
  const signedCount = signedInvoices.length;
  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  const handleSignClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleSign = async () => {
    if (!selectedInvoice || !wallet.address) return;

    setIsSigning(true);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // 1. Check and switch network if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${CHAIN_ID.toString(16)}`; // Convert 8119 to 0x1fb7

      if (currentChainId !== targetChainId) {
        try {
          // Try to switch to Shardeum Sphinx
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Shardeum Sphinx',
                nativeCurrency: {
                  name: 'Shardeum',
                  symbol: 'SHM',
                  decimals: 18
                },
                rpcUrls: ['https://api-mezame.shardeum.org/'],
                blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 2. Construct EIP-712 Data with proper hex chainId
      const domain = {
        name: "InvoiceManager",
        version: "1",
        chainId: CHAIN_ID, // Keep as number for EIP-712
        verifyingContract: CONTRACT_ADDRESS
      };

      const types = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        Invoice: [
          { name: "arweaveHash", type: "string" },
          { name: "amount", type: "uint256" }
        ]
      };

      const value = {
        arweaveHash: selectedInvoice.arweaveHash,
        amount: String(selectedInvoice.amount) // Ensure it's a string
      };

      const data = JSON.stringify({
        types: types,
        domain: domain,
        primaryType: "Invoice",
        message: value
      });

      // 3. Request Signature from MetaMask
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [wallet.address, data]
      });

      // 4. Send to Backend
      const res = await fetch(`${API_URL}/api/mnc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: selectedInvoice.tokenId,
          amount: selectedInvoice.amount,
          signature: signature
        })
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Invoice Verified!',
        description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
      });

      setIsSigning(false);
      setShowPreview(false);
      setSelectedInvoice(null);
      fetchInvoices();

    } catch (error: any) {
      console.error('Signing error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || 'Failed to sign invoice. Please try again.',
        variant: "destructive"
      });
      setIsSigning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">MNC Verifications</h1>
          <p className="text-muted-foreground">
            Review and sign invoices using EIP-712 typed data signatures
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Signed Total</p>
                  <p className="text-2xl font-bold text-success">{signedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCheck className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pending Verifications
            </CardTitle>
            <CardDescription>
              Invoices awaiting your EIP-712 signature verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-8 text-center"><Loader2 className="animate-spin inline" /></div> : (
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-5 rounded-xl border-2 border-warning/20 bg-warning/5 hover:border-warning/40 transition-all"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-xl font-bold text-foreground">
                              ${Number(invoice.amount).toLocaleString()}
                            </p>
                            <StatusBadge status={invoice.status.toLowerCase()} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            SME: {invoice.sme ? (invoice.sme.slice(0, 10) + '...' + invoice.sme.slice(-8)) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {invoice.arweaveHash && <HashDisplay hash={invoice.arweaveHash} />}
                        <Button
                          variant="hero"
                          onClick={() => handleSignClick(invoice)}
                        >
                          <PenLine className="w-4 h-4" />
                          verify
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingInvoices.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm">No pending invoices to verify.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Signed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Verified Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 rounded-lg border bg-success/5 border-success/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="font-semibold">
                        ${Number(invoice.amount).toLocaleString()}
                      </span>
                      <StatusBadge status={invoice.status.toLowerCase()} size="sm" />
                    </div>
                    <HashDisplay hash={invoice.arweaveHash} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EIP-712 Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">EIP-712 Signature Preview</DialogTitle>
            <DialogDescription className="text-center">
              Review the typed data before signing with MetaMask
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted font-mono text-sm">
                <div className="text-muted-foreground mb-3">Domain:</div>
                <div className="pl-4 space-y-1">
                  <p>name: "InvoiceManager"</p>
                  <p>version: "1"</p>
                  <p>chainId: {CHAIN_ID}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted font-mono text-sm">
                <div className="text-muted-foreground mb-3">Invoice Data:</div>
                <div className="pl-4 space-y-1">
                  <p className="break-all">
                    hash: "{selectedInvoice.arweaveHash}"
                  </p>
                  <p>amount: {selectedInvoice.amount} USDC</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreview(false)}
                  disabled={isSigning}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleSign}
                  disabled={isSigning}
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <PenLine className="w-4 h-4" />
                      Sign with MetaMask
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
