export type InvoiceStatus = 'pending' | 'signed' | 'minted' | 'funded' | 'settled' | 'Anchored' | 'Verified' | 'Funded' | 'Repaid' | 'Settled';

export type UserRole = 'sme' | 'mnc' | 'investor';

export interface Invoice {
  id: string;
  tokenId?: number | string;
  arweaveHash: string;
  amount: number | string;
  date?: string;
  dueDate?: string;
  status: InvoiceStatus | string; // Allow any string from backend
  sme?: string; // SME address
  smeAddress?: string;
  mncAddress?: string;
  nonce?: number;
  signature?: string;
  mncSignature?: string;
  fundedAmount?: number;
  estimatedApy?: number;
  riskScore?: number;
  createdAt?: Date | string;
  settledAt?: Date;
  principal?: string | number;
  currency?: string;
  issuer?: string;
  launchTime?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
}

export interface InvestorPortfolio {
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  pendingReturns: number;
}

export interface NFTCard {
  tokenId: number;
  invoiceId: string;
  value: number;
  riskScore: number;
  estimatedApy: number;
  status: InvoiceStatus;
  arweaveHash: string;
  timeFactor: number;
}

export interface EIP712TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    Invoice: { name: string; type: string }[];
  };
  primaryType: string;
  message: {
    hash: string;
    amount: number;
    nonce: number;
  };
}
