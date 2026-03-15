import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HashDisplayProps {
  hash: string;
  label?: string;
  truncate?: boolean;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({ hash, label, truncate = true }) => {
  const [copied, setCopied] = useState(false);

  const displayHash = truncate && hash.length > 20
    ? `${hash.slice(0, 10)}...${hash.slice(-8)}`
    : hash;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Hash copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      )}
      <div className="hash-display">
        <span className="hash-text">{displayHash}</span>
        <button onClick={handleCopy} className="copy-button" title="Copy to clipboard">
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      </div>
    </div>
  );
};
