import { MapPin, Plus, Trash2, Edit, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/hooks/use-addresses";
import { useCities } from "@/hooks/use-profile";
import { useState } from "react";
import { toast } from "sonner";

export function AddressBookPage() {
  const { data: addresses, isLoading } = useAddresses();
  const { data: cities } = useCities();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const updateAddress = useUpdateAddress();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    line1: "",
    line2: "",
    landmark: "",
    city_id: "",
    locality: "",
    pincode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.line1 || !formData.city_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingAddress) {
        await updateAddress.mutateAsync({
          addressId: editingAddress,
          data: {
            label: formData.label || undefined,
            line1: formData.line1,
            line2: formData.line2 || undefined,
            landmark: formData.landmark || undefined,
            city_id: formData.city_id,
            locality: formData.locality || undefined,
            pincode: formData.pincode || undefined,
          },
        });
        toast.success("Address updated successfully");
      } else {
        await createAddress.mutateAsync({
          label: formData.label || "Home",
          line1: formData.line1,
          line2: formData.line2 || undefined,
          landmark: formData.landmark || undefined,
          city_id: formData.city_id,
          locality: formData.locality || undefined,
          pincode: formData.pincode || undefined,
        });
        toast.success("Address added successfully");
      }
      setIsDialogOpen(false);
      setEditingAddress(null);
      setFormData({
        label: "",
        line1: "",
        line2: "",
        landmark: "",
        city_id: "",
        locality: "",
        pincode: "",
      });
    } catch {
      toast.error(editingAddress ? "Failed to update address" : "Failed to add address");
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress.mutateAsync(addressId);
      toast.success("Address deleted successfully");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const getCityName = (cityId: string) => {
    const city = cities?.find(c => c.id === cityId);
    return city ? `${city.name}, ${city.state}` : cityId;
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
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {editingAddress ? "Update your address details below" : "Add a new address to your address book"}
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
                  <Label htmlFor="line1">Address Line 1 *</Label>
                  <Input
                    id="line1"
                    placeholder="123 Main Street, Apartment 4B"
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input
                    id="line2"
                    placeholder="Building name, Floor, etc."
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    placeholder="Near City Mall"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City *</Label>
                    <Select
                      value={formData.city_id}
                      onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="500001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAddress.isPending || updateAddress.isPending}>
                  {createAddress.isPending || updateAddress.isPending
                    ? (editingAddress ? "Updating..." : "Adding...")
                    : (editingAddress ? "Update Address" : "Add Address")}
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
            <Card key={address.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {address.label?.toLowerCase() === "home" ? (
                        <Home className="w-6 h-6 text-primary" />
                      ) : (
                        <MapPin className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {address.label || "Address"}
                      </h3>
                      {address.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p className="font-medium text-foreground">{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      {address.landmark && (
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Near {address.landmark}</span>
                        </p>
                      )}
                      <p className="pt-1">
                        {address.locality && `${address.locality}, `}
                        {getCityName(address.city_id)}
                        {address.pincode && ` - ${address.pincode}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingAddress(address.id);
                        setFormData({
                          label: address.label || "",
                          line1: address.line1,
                          line2: address.line2 || "",
                          landmark: address.landmark || "",
                          city_id: address.city_id,
                          locality: address.locality || "",
                          pincode: address.pincode || "",
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
