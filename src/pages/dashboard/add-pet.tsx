import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePet, useSpecies, useBreeds, usePet, useUpdatePet } from "@/hooks/use-pets";
import type { PetSex } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export function AddPetPage() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const isEditMode = !!petId;

  const { data: existingPet, isLoading: petLoading } = usePet(petId || '');
  const createPet = useCreatePet();
  const updatePet = useUpdatePet(petId || '');
  const { data: species, isLoading: speciesLoading } = useSpecies();

  const [formData, setFormData] = useState({
    name: "",
    species_id: "",
    breed_id: "",
    approx_age_years: "",
    sex: "" as PetSex | "",
    notes: "",
  });

  const { data: breeds, isLoading: breedsLoading } = useBreeds(formData.species_id || undefined);

  // Load existing pet data when in edit mode
  useEffect(() => {
    if (existingPet && isEditMode) {
      setFormData({
        name: existingPet.name || "",
        species_id: existingPet.species_id || "",
        breed_id: existingPet.breed_id || "",
        approx_age_years: existingPet.approx_age_years?.toString() || "",
        sex: existingPet.sex || "",
        notes: existingPet.notes || "",
      });
    }
  }, [existingPet, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your pet's name");
      return;
    }

    if (!formData.species_id) {
      toast.error("Please select a species");
      return;
    }

    try {
      const petData = {
        name: formData.name,
        species_id: formData.species_id,
        breed_id: formData.breed_id || undefined,
        approx_age_years: formData.approx_age_years ? parseFloat(formData.approx_age_years) : undefined,
        sex: formData.sex || undefined,
        notes: formData.notes || undefined,
      };

      if (isEditMode) {
        await updatePet.mutateAsync(petData);
        toast.success("Pet updated successfully!");
        navigate(`/dashboard/pets/${petId}`);
      } else {
        await createPet.mutateAsync(petData);
        toast.success("Pet added successfully!");
        navigate("/dashboard/pets");
      }
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} pet. Please try again.`);
    }
  };

  if (isEditMode && petLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pet details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(isEditMode ? `/dashboard/pets/${petId}` : "/dashboard/pets")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEditMode ? "Back to Pet Details" : "Back to Pets"}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Pet" : "Add a New Pet"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode ? "Update your pet's information" : "Tell us about your furry friend"}
        </p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
          <CardDescription>
            Fill in the details about your pet. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                placeholder="Max"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-2"
                autoFocus
              />
            </div>

            {/* Species */}
            <div>
              <Label htmlFor="species">Species *</Label>
              {speciesLoading ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading species...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {species?.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, species_id: s.id, breed_id: "" })
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.species_id === s.id
                          ? "border-green-600 bg-green-600/10"
                          : "border-border hover:border-green-600/50"
                      }`}
                    >
                      <div className="font-semibold">{s.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Breed */}
            {formData.species_id && (
              <div>
                <Label htmlFor="breed">Breed (Optional)</Label>
                {breedsLoading ? (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading breeds...
                  </div>
                ) : breeds && breeds.length > 0 ? (
                  <select
                    id="breed"
                    value={formData.breed_id}
                    onChange={(e) =>
                      setFormData({ ...formData, breed_id: e.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a breed</option>
                    {breeds.map((breed) => (
                      <option key={breed.id} value={breed.id}>
                        {breed.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No breeds available for this species
                  </p>
                )}
              </div>
            )}

            {/* Sex */}
            <div>
              <Label>Sex (Optional)</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {(["male", "female", "unknown"] as const).map((sex) => (
                  <button
                    key={sex}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, sex })
                    }
                    className={`p-3 rounded-lg border-2 transition-all capitalize ${
                      formData.sex === sex
                        ? "border-green-600 bg-green-600/10"
                        : "border-border hover:border-green-600/50"
                    }`}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Approximate Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                step="0.5"
                min="0"
                max="50"
                placeholder="3.5"
                value={formData.approx_age_years}
                onChange={(e) =>
                  setFormData({ ...formData, approx_age_years: e.target.value })
                }
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    let rounded;
                    if (value < 0.5) {
                      rounded = 0.5;
                    } else {
                      // Round to nearest 0.5
                      rounded = Math.round(value * 2) / 2;
                    }
                    setFormData({ ...formData, approx_age_years: rounded.toString() });
                  }
                }}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">Age in years (auto-rounds to nearest 0.5)</p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                placeholder="Any additional information about your pet..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditMode ? `/dashboard/pets/${petId}` : "/dashboard/pets")}
                disabled={createPet.isPending || updatePet.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPet.isPending || updatePet.isPending}>
                {createPet.isPending || updatePet.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding Pet..."}
                  </>
                ) : (
                  isEditMode ? "Update Pet" : "Add Pet"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
