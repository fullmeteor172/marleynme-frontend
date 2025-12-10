import { useParams, useNavigate } from "react-router-dom";
import { usePet, useDeletePet, useUploadPetAvatar } from "@/hooks/use-pets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Upload, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { data: pet, isLoading } = usePet(petId!);
  const deletePet = useDeletePet();
  const uploadAvatar = useUploadPetAvatar(petId!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!petId) return;

    if (!confirm(`Are you sure you want to delete ${pet?.name}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePet.mutateAsync(petId);
      toast.success("Pet deleted successfully");
      navigate("/dashboard/pets");
    } catch (error) {
      toast.error("Failed to delete pet");
      setIsDeleting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Pet photo updated successfully");
    } catch (error) {
      toast.error("Failed to upload photo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pet details...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/pets")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Pets
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Pet not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate a color based on the pet's name for the placeholder
  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard/pets")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Pets
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Pet Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="w-32 h-32">
                <AvatarImage src={pet.profile_photo_url || undefined} />
                <AvatarFallback className={`${getColorFromName(pet.name)} text-white text-4xl`}>
                  <PawPrint className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Upload className="w-8 h-8 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl">{pet.name}</CardTitle>
                {pet.is_primary_owner && (
                  <Badge variant="secondary">Primary Owner</Badge>
                )}
              </div>
              <CardDescription className="text-lg">
                {pet.sex && <span className="capitalize">{pet.sex}</span>}
                {pet.approx_age_years && (
                  <span>
                    {pet.sex && " • "}
                    {pet.approx_age_years} year{pet.approx_age_years !== 1 ? "s" : ""} old
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Species</div>
              <div className="mt-1">{pet.species_id || "Not specified"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Breed</div>
              <div className="mt-1">{pet.breed_id || "Not specified"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Sex</div>
              <div className="mt-1 capitalize">{pet.sex || "Not specified"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Approximate Age</div>
              <div className="mt-1">
                {pet.approx_age_years
                  ? `${pet.approx_age_years} year${pet.approx_age_years !== 1 ? "s" : ""}`
                  : "Not specified"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notes</div>
              <div className="mt-1 whitespace-pre-wrap">
                {pet.notes || "No notes added"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="mt-1">
                {new Date(pet.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="mt-1">
                {new Date(pet.updated_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
          <CardDescription>
            View all services booked for {pet.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No services booked yet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
