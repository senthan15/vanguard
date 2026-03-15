import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { Invoice } from '@/types/vanguard';
import { Upload, FileText, DollarSign, Loader2, Plus, TrendingUp, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWalletContext } from '@/contexts/WalletContext';

const API_URL = 'http://localhost:3002'; // Hardcoded based on backend .env

export const SMEDashboard: React.FC = () => {
  const { wallet } = useWalletContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedHash, setUploadedHash] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    file: null as File | null,
    date: '',
    amount: '',
  });

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invoices`);
      const data = await response.json();
      if (data.success) {
        // Filter for current user if wallet is connected
        if (wallet.address) {
          const myInvoices = data.invoices.filter((inv: any) =>
            inv.sme && inv.sme.toLowerCase() === wallet.address.toLowerCase()
          );
          setInvoices(myInvoices);
        } else {
          setInvoices([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, [wallet.address]);

  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const fundedValue = invoices
    .filter((inv) => inv.status === 'Funded' || inv.status === 'Settled' || inv.status === 'Repaid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  const pendingCount = invoices.filter((inv) => inv.status === 'Anchored' || inv.status === 'Verified').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData((prev) => ({ ...prev, file }));
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!wallet.address) {
      toast({ title: "Wallet not connected", description: "Please connect wallet first", variant: "destructive" });
      return;
    }
    if (!formData.file || !formData.date || !formData.amount) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate Arweave upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockHash = `ar://${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setUploadedHash(mockHash);

      // Call Backend
      const payload = {
        arweaveHash: mockHash,
        tokenURI: `https://arweave.net/${mockHash}`, // Placeholder
        amount: formData.amount,
        dueDate: formData.date,
        smeAddress: wallet.address
      };

      const res = await fetch(`${API_URL}/api/sme/anchor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.error) throw new Error(result.error);
      if (!result.success) throw new Error(result.message || "Upload failed");

      toast({
        title: 'Invoice Anchored!',
        description: `Invoice ${result.tokenId} has been anchored to the blockchain and awaiting MNC verification.`,
      });

      setFormData({ file: null, date: '', amount: '' });
      fetchInvoices();

    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SME Dashboard</h1>
          <p className="text-muted-foreground">Upload invoices and track your funding status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoice Value</p>
                  <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Funded Amount</p>
                  <p className="text-2xl font-bold text-success">${fundedValue.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Invoice
            </CardTitle>
            <CardDescription>
              Upload your invoice PDF to begin the verification process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoice-file">Invoice PDF</Label>
                <div className="relative">
                  <Input
                    id="invoice-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {formData.file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-success">
                      <FileText className="w-4 h-4" />
                      {formData.file.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-date">Invoice Date</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Amount (USDC)</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="premium"
                onClick={handleUpload}
                disabled={isUploading || !wallet.address}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Anchoring on Blockchain...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Upload & Anchor
                  </>
                )}
              </Button>

              {uploadedHash && (
                <div className="flex-1 ml-6">
                  <HashDisplay hash={uploadedHash} label="Arweave Transaction Hash" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>My Invoices</CardTitle>
            <CardDescription>Track the status of your uploaded invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : invoices.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No invoices found. Ensure you have connected your wallet and uploaded an invoice.</div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-foreground">
                              ${Number(invoice.amount).toLocaleString()}
                            </p>
                            <StatusBadge status={invoice.status.toLowerCase()} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No Date'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {invoice.arweaveHash && <HashDisplay hash={invoice.arweaveHash} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
