import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LicenseActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LicenseActivationDialog({
  open,
  onOpenChange,
}: LicenseActivationDialogProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [machineId, setMachineId] = useState('');
  const [status, setStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      // Get machine ID when dialog opens
      window.license.getMachineId().then((id: string) => {
        setMachineId(id);
      }).catch((error: any) => {
        console.error('Error getting machine ID:', error);
      });
    }
  }, [open]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;

    setLoading(true);
    try {
      const result = await window.license.validateLicenseKey(licenseKey);
      
      if (result.valid) {
        // Save valid license
        await window.license.saveLicenseValidation(licenseKey, true, result.expiryDate);
        setStatus({
          valid: true,
          message: result.expiryDate 
            ? `License activated successfully. Valid until ${new Date(result.expiryDate).toLocaleDateString()}.`
            : 'License activated successfully.'
        });
        
        // Close dialog after successful activation
        setTimeout(() => {
          onOpenChange(false);
          // Reload the application to apply license
          window.electron.ipcRenderer.send('app:reload');
        }, 3000);
      } else {
        setStatus({
          valid: false,
          message: result.error || 'Invalid license key.'
        });
      }
    } catch (error) {
      console.error('Error validating license:', error);
      setStatus({
        valid: false,
        message: 'An error occurred while validating the license.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
          e.preventDefault();
        }}  onEscapeKeyDown={(e) => e.preventDefault()} hideClose>
        <DialogHeader>
          <DialogTitle>License Activation</DialogTitle>
          <DialogDescription>
            This application requires a valid license to run.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="machine-id">Machine ID</Label>
            <div className="flex">
              <Input
                id="machine-id"
                value={machineId}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={copyMachineId}
                title="Copy machine ID"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this ID with your administrator to get a license key.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter your license key"
            />
          </div>

          {status && (
            <Alert variant={status.valid ? "default" : "destructive"}>
              {status.valid ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.valid ? 'Activation Successful' : 'Activation Failed'}
              </AlertTitle>
              <AlertDescription>
                {status.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleActivate}
            disabled={loading || !licenseKey.trim()}
          >
            {loading ? 'Activating...' : 'Activate License'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}