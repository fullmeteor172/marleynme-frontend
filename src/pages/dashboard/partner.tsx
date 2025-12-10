import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PartnerPortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partner Portal</h1>
        <p className="text-muted-foreground mt-1">
          Manage your service partner profile
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Partner Portal Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The partner portal is being built. You'll soon be able to manage your
            KYC documents and service requests here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
