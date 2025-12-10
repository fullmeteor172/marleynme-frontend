import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAddresses, useCreateAddress, useDeleteAddress } from "@/hooks/use-addresses";
import { useState } from "react";
import { toast } from "sonner";

export function AddressBookPage() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    streetAddress: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.streetAddress || !formData.city || !formData.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAddress.mutateAsync({
        label: formData.label || "Home",
        street_address: formData.streetAddress,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      });
      toast.success("Address added successfully");
      setIsDialogOpen(false);
      setFormData({
        label: "",
        streetAddress: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await deleteAddress.mutateAsync(addressId);
      toast.success("Address deleted successfully");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved addresses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Add a new address to your address book
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (e.g., Home, Office)</Label>
                  <Input
                    id="label"
                    placeholder="Home"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    placeholder="123 Main Street"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    placeholder="Downtown"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Hyderabad"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Telangana"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="500001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAddress.isPending}>
                  {createAddress.isPending ? "Adding..." : "Add Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!addresses || addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No addresses saved</h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Add your addresses to make booking services easier
            </p>
            <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {address.label}
                      {address.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{address.street_address}</p>
                  {address.locality && <p>{address.locality}</p>}
                  <p>
                    {address.city}
                    {address.state && `, ${address.state}`} - {address.pincode}
                  </p>
                  {address.country && <p>{address.country}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
