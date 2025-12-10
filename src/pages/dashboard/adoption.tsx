import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export function AdoptionCenterPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adoption Center</h1>
        <p className="text-muted-foreground mt-1">
          Find your perfect furry companion
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Our pet adoption center is currently being developed. Soon you'll be
            able to find and adopt pets looking for their forever homes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
