import { MapPin, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AddressBookPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved addresses
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No addresses saved</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Add your addresses to make booking services easier
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Address
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
