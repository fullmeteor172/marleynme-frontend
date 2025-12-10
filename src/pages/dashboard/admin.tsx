import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminPortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
        <p className="text-muted-foreground mt-1">
          System administration and management
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Admin Portal Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The admin portal is being built with comprehensive management tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
