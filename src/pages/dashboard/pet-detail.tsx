import { useParams, useNavigate } from "react-router-dom";
import { usePet, useDeletePet, useUploadPetAvatar, useSpecies, useBreeds } from "@/hooks/use-pets";
import { useServices, useServicePricing } from "@/hooks/use-services";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ArrowLeft, Edit, Trash2, Upload, PawPrint, Sparkles, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Crown, Dog, Calendar as CalIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { ServiceBookingDialog } from "@/components/booking/service-booking-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Service, ServiceSpecies } from "@/types";

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { data: pet, isLoading } = usePet(petId!);
  const { data: allSpecies } = useSpecies();
  const { data: allBreeds } = useBreeds(pet?.species_id);
  const { data: allServices } = useServices();
  const { data: allPricing } = useServicePricing();
  const { data: serviceRequests, isLoading: requestsLoading } = useServiceRequests();
  const deletePet = useDeletePet();
  const uploadAvatar = useUploadPetAvatar(petId!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  const [bookingDialog, setBookingDialog] = useState<{
    open: boolean;
    service: Service | null;
    pricing: ServiceSpecies | null;
  }>({
    open: false,
    service: null,
    pricing: null,
  });

  // Get species and breed names
  const speciesName = allSpecies?.find(s => s.id === pet?.species_id)?.name || "Not specified";
  const breedName = allBreeds?.find(b => b.id === pet?.breed_id)?.name || "Not specified";

  // Filter service requests for this pet
  const petServiceRequests = serviceRequests?.filter(req => req.pet_id === petId) || [];

  // Separate upcoming and past services
  const now = new Date();
  const upcomingServices = petServiceRequests.filter(req => {
    const reqDate = new Date(req.requested_datetime);
    return reqDate >= now && !['completed', 'cancelled'].includes(req.status);
  });
  const pastServices = petServiceRequests.filter(req => {
    const reqDate = new Date(req.requested_datetime);
    return reqDate < now || ['completed', 'cancelled'].includes(req.status);
  });

  // Get available services for this pet's species
  const availableServices = allPricing
    ?.filter(pricing => pricing.species_id === pet?.species_id && pricing.is_active)
    .map(pricing => {
      const service = allServices?.find(s => s.id === pricing.service_id);
      return service ? { service, pricing } : null;
    })
    .filter((item): item is { service: Service; pricing: ServiceSpecies } => item !== null) || [];

  // Status helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_assignment: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      assigned: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      upcoming: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      in_progress: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      awaiting_completion: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      completed: "bg-green-500/10 text-green-700 dark:text-green-400",
      cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-3 h-3";
    switch (status) {
      case "pending_assignment":
        return <Clock className={iconClass} />;
      case "assigned":
      case "upcoming":
        return <AlertCircle className={iconClass} />;
      case "in_progress":
        return <Loader2 className={`${iconClass} animate-spin`} />;
      case "awaiting_completion":
        return <AlertCircle className={iconClass} />;
      case "completed":
        return <CheckCircle2 className={iconClass} />;
      case "cancelled":
        return <XCircle className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const handleDelete = async () => {
    if (!petId) return;

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
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/dashboard/pets/${petId}/edit`)}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={isDeleting}>
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {pet?.name} from your account. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Pet Info Card - Combined and Compact */}
      <TooltipProvider>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Section */}
              <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
                <Avatar className="w-28 h-28 ring-4 ring-offset-4 ring-primary/20">
                  <AvatarImage src={pet.profile_photo_url || undefined} />
                  <AvatarFallback className={`${getColorFromName(pet.name)} text-white text-3xl`}>
                    <PawPrint className="w-14 h-14" />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <h1 className="text-2xl font-bold">{pet.name}</h1>
                  {pet.is_primary_owner && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Crown className="w-5 h-5 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Primary Owner</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Dog className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{speciesName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PawPrint className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{breedName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{pet.sex === 'male' ? '♂' : pet.sex === 'female' ? '♀' : '?'}</span>
                    <span className="capitalize">{pet.sex || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{pet.approx_age_years ? `${pet.approx_age_years}y old` : "Age unknown"}</span>
                  </div>
                </div>

                {/* Notes Section */}
                {pet.notes && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground whitespace-pre-wrap">{pet.notes}</p>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Added {new Date(pet.created_at).toLocaleDateString()}</span>
                  <span>Updated {new Date(pet.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Available Services Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            Available Services
          </CardTitle>
          <CardDescription className="text-sm">
            Services available for {speciesName === "Not specified" ? "your pet" : speciesName}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">
              No services available for this species yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableServices.map(({ service, pricing }) => (
                <div
                  key={service.id}
                  className="group relative rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200"
                >
                  {/* Service name and description */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-base leading-tight">{service.name}</h4>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Price and action */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-primary">
                        {pricing.currency === 'INR' ? '₹' : pricing.currency}{' '}
                        {pricing.base_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        setBookingDialog({
                          open: true,
                          service,
                          pricing,
                        })
                      }
                    >
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Services Card */}
      {upcomingServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Services
            </CardTitle>
            <CardDescription>
              Scheduled services for {pet.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {upcomingServices.map((request) => {
                  const service = allServices?.find((s) => s.id === request.service_id);
                  return (
                    <div
                      key={request.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/dashboard/service-requests/${request.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{service?.name || "Unknown Service"}</h4>
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(request.status)} text-xs`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {formatStatus(request.status)}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.requested_datetime), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {request.currency === 'INR' ? '₹' : request.currency} {request.estimated_price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Service</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Date & Time</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingServices.map((request, index) => {
                      const service = allServices?.find((s) => s.id === request.service_id);
                      return (
                        <TableRow
                          key={request.id}
                          className={`cursor-pointer hover:bg-primary/5 ${index % 2 === 1 ? 'bg-muted/20' : ''}`}
                          onClick={() => navigate(`/dashboard/service-requests/${request.id}`)}
                        >
                          <TableCell className="font-medium">{service?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(request.requested_datetime), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{format(new Date(request.requested_datetime), "h:mm a")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {formatStatus(request.status)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {request.currency === 'INR' ? '₹' : request.currency} {request.estimated_price.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
          <CardDescription>
            {pastServices.length > 0
              ? `Past services for ${pet.name}`
              : `View all services booked for ${pet.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading service history...
            </p>
          ) : pastServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No service history yet. Book a service above to get started!
            </p>
          ) : isMobile ? (
            <div className="space-y-3">
              {pastServices.map((request) => {
                const service = allServices?.find((s) => s.id === request.service_id);
                return (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/dashboard/service-requests/${request.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{service?.name || "Unknown Service"}</h4>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(request.status)} text-xs`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {formatStatus(request.status)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.requested_datetime), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {request.currency === 'INR' ? '₹' : request.currency} {request.estimated_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Service</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Date & Time</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastServices.map((request, index) => {
                    const service = allServices?.find((s) => s.id === request.service_id);
                    return (
                      <TableRow
                        key={request.id}
                        className={`cursor-pointer hover:bg-primary/5 ${index % 2 === 1 ? 'bg-muted/20' : ''}`}
                        onClick={() => navigate(`/dashboard/service-requests/${request.id}`)}
                      >
                        <TableCell className="font-medium">{service?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{format(new Date(request.requested_datetime), "MMM d, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(request.requested_datetime), "h:mm a")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {formatStatus(request.status)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {request.currency === 'INR' ? '₹' : request.currency} {request.estimated_price.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      {bookingDialog.service && bookingDialog.pricing && (
        <ServiceBookingDialog
          open={bookingDialog.open}
          onOpenChange={(open) =>
            setBookingDialog({ open, service: null, pricing: null })
          }
          service={bookingDialog.service}
          pricing={bookingDialog.pricing}
          pet={pet}
        />
      )}
    </div>
  );
}
