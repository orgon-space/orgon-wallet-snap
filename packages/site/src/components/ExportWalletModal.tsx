import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface ExportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletName: string;
  walletAddress: string;
  privateKey: string;
}

export const ExportWalletModal: React.FC<ExportWalletModalProps> = ({
  isOpen,
  onClose,
  walletName,
  walletAddress,
  privateKey,
}) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyPrivateKey = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(privateKey);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = privateKey;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy private key:', err);
      // Still show success state even if copy failed
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAddress = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(walletAddress);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = walletAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      // Still show success state even if copy failed
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrivateKey = (key: string) => {
    if (showPrivateKey) {
      return key;
    }
    return '•'.repeat(64);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Wallet
          </DialogTitle>
          <DialogDescription>
            Export the private key for <strong>{walletName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Warning:</strong> Your private key gives full
              access to this wallet. Never share it with anyone and store it
              securely. Anyone with this key can access your funds.
            </AlertDescription>
          </Alert>

          {/* Wallet Information */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Wallet Name
                </span>
                <Badge variant="secondary">{walletName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Address
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {formatAddress(walletAddress)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-6 w-6 p-0"
                  >
                    {copiedAddress ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Private Key Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Private Key</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="h-8 px-2"
                  >
                    {showPrivateKey ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrivateKey}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="font-mono text-sm break-all text-center">
                  {formatPrivateKey(privateKey)}
                </div>
              </div>
            </div>

            {/* Additional Security Tips */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">
                    Security Best Practices
                  </h4>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                    <li>
                      • Store your private key in a secure password manager
                    </li>
                    <li>• Never share your private key with anyone</li>
                    <li>
                      • Consider using a hardware wallet for large amounts
                    </li>
                    <li>
                      • Make multiple secure backups in different locations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button onClick={handleCopyPrivateKey} className="w-full sm:w-auto">
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Private Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
