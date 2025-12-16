import { useNavigate } from "react-router-dom";
import { usePets, useSpecies } from "@/hooks/use-pets";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { useServices } from "@/hooks/use-services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  PawPrint,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Crown,
  Calendar,
  Dog,
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export function PetsHomePage() {
  const navigate = useNavigate();
  const { data: pets, isLoading: petsLoading } = usePets();
  const { data: allSpecies } = useSpecies();
  const { data: allServices } = useServices();
  const { data: serviceRequests, isLoading: requestsLoading } = useServiceRequests();
  const isMobile = useIsMobile();

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

  if (petsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Pets Home</h1>
        <p className="text-muted-foreground mt-1">
          Manage your pets and their care services
        </p>
      </div>

      {/* Your Pets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Pets</h2>
          <Button onClick={() => navigate("/dashboard/pets/add")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Pet
          </Button>
        </div>

        {!pets || pets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PawPrint className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first pet to start managing their care
              </p>
              <Button onClick={() => navigate("/dashboard/pets/add")} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => {
                const speciesName = allSpecies?.find(s => s.id === pet.species_id)?.name;
                return (
                  <Card
                    key={pet.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
                    onClick={() => navigate(`/dashboard/pets/${pet.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16 flex-shrink-0 ring-2 ring-offset-2 ring-transparent group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={pet.profile_photo_url || undefined} />
                          <AvatarFallback className={`${getColorFromName(pet.name)} text-white`}>
                            <PawPrint className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate text-lg">{pet.name}</h3>
                            {pet.is_primary_owner && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Primary Owner</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            {speciesName && (
                              <span className="flex items-center gap-1">
                                <Dog className="w-3.5 h-3.5" />
                                {speciesName}
                              </span>
                            )}
                            {pet.sex && (
                              <span className="capitalize">
                                {pet.sex === 'male' ? '♂' : pet.sex === 'female' ? '♀' : ''} {pet.sex}
                              </span>
                            )}
                            {pet.approx_age_years && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {pet.approx_age_years}y
                              </span>
                            )}
                          </div>
                          {!speciesName && !pet.sex && !pet.approx_age_years && (
                            <p className="text-sm text-muted-foreground">Details not set</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Service History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Service History</h2>
        </div>

        {requestsLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Loading service history...
            </CardContent>
          </Card>
        ) : !serviceRequests || serviceRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No service requests yet. Book a service for your pet to get started!
              </p>
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="space-y-3">
            {serviceRequests.map((request) => {
              const pet = pets?.find((p) => p.id === request.pet_id);
              const service = allServices?.find((s) => s.id === request.service_id);
              return (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/dashboard/service-requests/${request.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{service?.name || "Unknown Service"}</h4>
                        <p className="text-sm text-muted-foreground">For {pet?.name || "Unknown"}</p>
                      </div>
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
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.requested_datetime), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="font-semibold">
                        {request.currency === 'INR' ? '₹' : request.currency}{' '}
                        {request.estimated_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Service</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Pet</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Date & Time</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRequests.map((request, index) => {
                    const pet = pets?.find((p) => p.id === request.pet_id);
                    const service = allServices?.find((s) => s.id === request.service_id);
                    return (
                      <TableRow
                        key={request.id}
                        className={`cursor-pointer transition-colors hover:bg-primary/5 ${
                          index % 2 === 1 ? 'bg-muted/20' : ''
                        }`}
                        onClick={() =>
                          navigate(`/dashboard/service-requests/${request.id}`)
                        }
                      >
                        <TableCell className="font-medium py-3 px-4">
                          {service?.name || "Unknown Service"}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-muted-foreground">
                          {pet?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm">{format(new Date(request.requested_datetime), "MMM d, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(request.requested_datetime), "h:mm a")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(request.status)} text-xs font-medium px-2.5 py-0.5`}
                          >
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(request.status)}
                              {formatStatus(request.status)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                          {request.currency === 'INR' ? '₹' : request.currency}{' '}
                          {request.estimated_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
