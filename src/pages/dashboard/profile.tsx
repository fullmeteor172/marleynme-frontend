import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile, useUpdateProfile, useCities } from "@/hooks/use-profile";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserProfilePage() {
  const { profile } = useAuthStore();
  const { refetch } = useProfile();
  const { data: cities } = useCities();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  // Helper to strip +91 prefix from phone if present
  const stripPhonePrefix = (phone: string) => {
    if (phone.startsWith("+91")) {
      return phone.substring(3);
    }
    return phone;
  };

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    phone: stripPhonePrefix(profile?.phone || ""),
    cityId: profile?.city_id || "",
    locality: profile?.locality || "",
    pincode: profile?.pincode || "",
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: stripPhonePrefix(profile.phone || ""),
        cityId: profile.city_id || "",
        locality: profile.locality || "",
        pincode: profile.pincode || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone ? `+91${formData.phone}` : undefined,
        city_id: formData.cityId,
        locality: formData.locality,
        pincode: formData.pincode,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form to profile data
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: stripPhonePrefix(profile.phone || ""),
        cityId: profile.city_id || "",
        locality: profile.locality || "",
        pincode: profile.pincode || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {isEditing ? "Update your personal details" : "Your personal details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 border rounded-md bg-muted text-sm font-medium h-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className="w-6 h-4 flex-shrink-0">
                    <rect width="36" height="24" fill="#FF9933"/>
                    <rect width="36" height="16" y="8" fill="#fff"/>
                    <rect width="36" height="8" y="16" fill="#138808"/>
                    <g fill="#000080">
                      <circle cx="18" cy="12" r="3.5" fill="none" stroke="#000080" strokeWidth="0.5"/>
                      {[...Array(24)].map((_, i) => (
                        <line
                          key={i}
                          x1="18"
                          y1="12"
                          x2="18"
                          y2="8.5"
                          stroke="#000080"
                          strokeWidth="0.4"
                          transform={`rotate(${i * 15} 18 12)`}
                        />
                      ))}
                    </g>
                  </svg>
                  <span>+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  maxLength={10}
                  disabled={!isEditing}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={formData.cityId}
                onValueChange={(value) =>
                  setFormData({ ...formData, cityId: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city">
                    {formData.cityId && cities
                      ? cities.find(c => c.id === formData.cityId)?.name + ", " + cities.find(c => c.id === formData.cityId)?.state
                      : "Select a city"}
                  </SelectValue>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, locality: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Your current roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile?.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role.replace("_", " ").toUpperCase()}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
