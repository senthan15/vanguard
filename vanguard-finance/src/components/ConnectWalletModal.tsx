import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { connect, isConnecting, error, wallet } = useWalletContext();
  const navigate = useNavigate();

  const handleConnect = async () => {
    const success = await connect();
    if (success) {
      onOpenChange(false);
      navigate('/sme');
    }
  };

  React.useEffect(() => {
    if (wallet.isConnected && open) {
      onOpenChange(false);
      navigate('/sme');
    }
  }, [wallet.isConnected, open, onOpenChange, navigate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-base">
            Connect your MetaMask wallet to access the Vanguard platform on Polygon Amoy Testnet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">MetaMask Required</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Make sure you have MetaMask installed and set to Polygon Amoy Testnet.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="text-center">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              Don't have MetaMask?
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Network: <span className="font-medium text-foreground">Polygon Amoy Testnet</span></p>
            <p>Chain ID: <span className="font-mono text-foreground">80002</span></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
