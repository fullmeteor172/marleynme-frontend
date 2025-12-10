import { useNavigate } from "react-router-dom";
import { usePets } from "@/hooks/use-pets";
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
import { Plus, PawPrint } from "lucide-react";
import { format } from "date-fns";

export function PetsHomePage() {
  const navigate = useNavigate();
  const { data: pets, isLoading: petsLoading } = usePets();
  const { data: serviceRequests, isLoading: requestsLoading } = useServiceRequests();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Card
                key={pet.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/dashboard/pets/${pet.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={pet.profile_photo_url || undefined} />
                      <AvatarFallback>
                        <PawPrint className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{pet.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {pet.sex && (
                          <span className="capitalize">{pet.sex}</span>
                        )}
                        {pet.approx_age_years && (
                          <span>
                            {pet.sex && " • "}
                            {pet.approx_age_years} years
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pet.is_primary_owner && (
                    <Badge variant="secondary" className="text-xs">
                      Primary Owner
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Service History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Service History</h2>
        </div>

        {requestsLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading service history...
            </CardContent>
          </Card>
        ) : !serviceRequests || serviceRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No service requests yet. Book a service for your pet to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRequests.map((request) => {
                    const pet = pets?.find((p) => p.id === request.pet_id);
                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(`/dashboard/service-requests/${request.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {request.service_id}
                        </TableCell>
                        <TableCell>{pet?.name || "Unknown"}</TableCell>
                        <TableCell>
                          {format(new Date(request.requested_datetime), "PPp")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {formatStatus(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.currency} {request.estimated_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
