import { useParams, useNavigate } from "react-router-dom";
import { useServiceRequest, useUpdateServiceRequest } from "@/hooks/use-service-requests";
import { usePet } from "@/hooks/use-pets";
import { useServices } from "@/hooks/use-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  ArrowLeft,
  CalendarIcon,
  Edit,
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";
import { format, addDays, isAfter } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ServiceRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading } = useServiceRequest(requestId!);
  const { data: pet } = usePet(request?.pet_id || "");
  const { data: allServices } = useServices();
  const updateRequest = useUpdateServiceRequest(requestId!);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState<Date>();
  const [editedTime, setEditedTime] = useState<string>("");

  const service = allServices?.find(s => s.id === request?.service_id);

  const handleEdit = () => {
    if (request) {
      const requestDate = new Date(request.requested_datetime);
      setEditedDate(requestDate);
      setEditedTime(format(requestDate, "HH:mm"));
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedDate || !editedTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Validate 48 hour minimum
    const selectedDateTime = new Date(editedDate);
    const [hours, minutes] = editedTime.split(":").map(Number);
    selectedDateTime.setHours(hours, minutes);

    const minDateTime = addDays(new Date(), 2);
    if (!isAfter(selectedDateTime, minDateTime)) {
      toast.error("Service must be rescheduled at least 48 hours in advance");
      return;
    }

    try {
      await updateRequest.mutateAsync({
        requested_datetime: selectedDateTime.toISOString(),
      });
      toast.success("Service request updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update service request");
    }
  };

  const handleCancel = async () => {
    try {
      await updateRequest.mutateAsync({
        status: "cancelled",
      });
      toast.success("Service request cancelled");
      navigate("/dashboard/pets");
    } catch {
      toast.error("Failed to cancel service request");
    }
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

  const getStatusIcon = (status: string) => {
    const iconClass = "w-4 h-4";
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

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const canEdit = request && ["pending_assignment", "assigned", "upcoming"].includes(request.status);
  const canCancel = request && request.status !== "cancelled" && request.status !== "completed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading service request...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/pets")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Pets
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Service request not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard/pets")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Pets
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" className="gap-2" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
              Edit Timing
            </Button>
          )}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancel Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Service Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your service request for {service?.name}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{service?.name || "Service"}</CardTitle>
              <CardDescription>
                For {pet?.name} • Requested on {format(new Date(request.created_at), "PPP")}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(request.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                {formatStatus(request.status)}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Service</div>
              <div className="font-medium">{service?.name}</div>
              {service?.description && (
                <div className="text-sm text-muted-foreground mt-1">{service.description}</div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Pet</div>
              <div className="font-medium">{pet?.name}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Delivery Mode</div>
              <div className="font-medium capitalize">{request.requested_delivery_mode.replace(/_/g, " ")}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Estimated Price</div>
              <div className="text-2xl font-bold">
                {request.currency} {request.estimated_price.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
          {isEditing && (
            <CardDescription className="text-amber-600 dark:text-amber-400">
              Note: Service must be rescheduled at least 48 hours in advance
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedDate ? format(editedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedDate}
                        onSelect={setEditedDate}
                        disabled={(date) => date < addDays(new Date(), 2)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Select Time *</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} disabled={updateRequest.isPending}>
                  {updateRequest.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(request.requested_datetime), "PPPP 'at' p")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Phone className="w-4 h-4" />
              Contact Phone
            </div>
            <div className="font-medium">{request.customer_contact_phone}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              Service Address
            </div>
            <div className="text-sm whitespace-pre-wrap">{request.customer_address_text}</div>
          </div>

          {request.customer_notes && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</div>
              <div className="text-sm p-3 bg-muted rounded-lg whitespace-pre-wrap">
                {request.customer_notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(request.admin_notes || request.assigned_partner_id) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.assigned_partner_id && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Assigned Partner</div>
                <div className="font-medium">{request.assigned_partner_id}</div>
              </div>
            )}
            {request.admin_notes && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</div>
                <div className="text-sm p-3 bg-muted rounded-lg whitespace-pre-wrap">
                  {request.admin_notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
