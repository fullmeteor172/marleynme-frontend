import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, LogOut } from 'lucide-react';

interface SessionExpiringWarningProps {
  open: boolean;
  expiresInMs: number | null;
  onRefresh: () => void;
  onLogout: () => void;
  onOpenChange: (open: boolean) => void;
}

export function SessionExpiringWarning({
  open,
  expiresInMs,
  onRefresh,
  onLogout,
  onOpenChange,
}: SessionExpiringWarningProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update countdown
  useEffect(() => {
    if (!open || expiresInMs === null) return;

    const updateTimeLeft = () => {
      const remaining = expiresInMs - (Date.now() - startTime);

      if (remaining <= 0) {
        setTimeLeft('0:00');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    const startTime = Date.now();
    updateTimeLeft();

    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [open, expiresInMs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Your session will expire in <span className="font-mono font-semibold text-amber-600">{timeLeft}</span>.
              </p>
              <p>
                Would you like to extend your session or log out?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Extending...' : 'Extend Session'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
