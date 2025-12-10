import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Marley 'n' Me
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your pet care dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            disabled
          >
            <FaApple className="w-5 h-5" />
            Continue with Apple
            <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
