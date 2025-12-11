import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAddresses, useCreateAddress } from "@/hooks/use-addresses";
import { useCreateServiceRequest } from "@/hooks/use-service-requests";
import { useCities } from "@/hooks/use-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isAfter } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Service, ServiceSpecies, Pet, Address } from "@/types";

interface ServiceBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  pricing: ServiceSpecies;
  pet: Pet;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function ServiceBookingDialog({
  open,
  onOpenChange,
  service,
  pricing,
  pet,
}: ServiceBookingDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: "",
    line1: "",
    line2: "",
    landmark: "",
    city_id: "",
    locality: "",
    pincode: "",
  });

  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
  const { data: cities } = useCities();
  const createAddress = useCreateAddress();
  const createServiceRequest = useCreateServiceRequest();

  // Initialize phone number from profile
  useState(() => {
    if (profile?.phone) {
      setPhoneNumber(profile.phone);
    }
  });

  const resetForm = () => {
    setStep(1);
    setPhoneNumber(profile?.phone || "");
    setSelectedAddressId("");
    setShowAddAddress(false);
    setSelectedDate(undefined);
    setSelectedTime("");
    setNotes("");
    setAddressForm({
      label: "",
      line1: "",
      line2: "",
      landmark: "",
      city_id: "",
      locality: "",
      pincode: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = async () => {
    // Validation for each step
    if (step === 1) {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
    } else if (step === 2) {
      if (showAddAddress) {
        // Validate and create new address
        if (!addressForm.line1 || !addressForm.city_id) {
          toast.error("Please fill in all required address fields");
          return;
        }
        try {
          const newAddress = await createAddress.mutateAsync({
            label: addressForm.label || "Home",
            line1: addressForm.line1,
            line2: addressForm.line2 || undefined,
            landmark: addressForm.landmark || undefined,
            city_id: addressForm.city_id,
            locality: addressForm.locality || undefined,
            pincode: addressForm.pincode || undefined,
          });
          setSelectedAddressId(newAddress.id);
          setShowAddAddress(false);
        } catch {
          toast.error("Failed to add address");
          return;
        }
      } else if (!selectedAddressId) {
        toast.error("Please select an address");
        return;
      }
    } else if (step === 3) {
      if (!selectedDate || !selectedTime) {
        toast.error("Please select both date and time");
        return;
      }
      // Validate 48 hour minimum
      const selectedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      selectedDateTime.setHours(hours, minutes);

      const minDateTime = addDays(new Date(), 2);
      if (!isAfter(selectedDateTime, minDateTime)) {
        toast.error("Service must be scheduled at least 48 hours in advance");
        return;
      }
    }

    if (step < 5) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (showAddAddress) {
      setShowAddAddress(false);
    } else if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedAddressId) {
      toast.error("Please complete all required fields");
      return;
    }

    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    selectedDateTime.setHours(hours, minutes);

    try {
      await createServiceRequest.mutateAsync({
        pet_id: pet.id,
        service_id: service.id,
        requested_city_id: profile?.city_id || addresses?.find(a => a.id === selectedAddressId)?.city_id || "",
        requested_delivery_mode: "at_home_client",
        customer_address_id: selectedAddressId,
        requested_datetime: selectedDateTime.toISOString(),
        customer_contact_phone: phoneNumber,
        customer_notes: notes || undefined,
      });
      toast.success("Service request created successfully!");
      handleClose();
    } catch {
      toast.error("Failed to create service request");
    }
  };

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
  const getCityName = (cityId: string) => {
    const city = cities?.find(c => c.id === cityId);
    return city ? `${city.name}, ${city.state}` : cityId;
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Confirm Phone Number";
      case 2:
        return showAddAddress ? "Add New Address" : "Confirm Address";
      case 3:
        return "Select Date & Time";
      case 4:
        return "Additional Notes";
      case 5:
        return "Review & Confirm";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {service.name}</DialogTitle>
          <DialogDescription>
            For {pet.name} • {pricing.currency} {pricing.base_price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all",
                s === step ? "w-8 bg-primary" : "w-2 bg-muted",
                s < step && "bg-primary/50"
              )}
            />
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">{getStepTitle()}</h3>

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We'll use this number to contact you about this service request
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && !showAddAddress && (
            <div className="space-y-4">
              {addresses && addresses.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label>Select Address *</Label>
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.label || "Address"} - {address.line1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedAddress && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{selectedAddress.label || "Address"}</p>
                      <p className="text-sm">{selectedAddress.line1}</p>
                      {selectedAddress.line2 && <p className="text-sm">{selectedAddress.line2}</p>}
                      {selectedAddress.landmark && (
                        <p className="text-sm text-muted-foreground">Near {selectedAddress.landmark}</p>
                      )}
                      <p className="text-sm">
                        {selectedAddress.locality && `${selectedAddress.locality}, `}
                        {getCityName(selectedAddress.city_id)}
                        {selectedAddress.pincode && ` - ${selectedAddress.pincode}`}
                      </p>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAddress(true)}
                    className="w-full"
                  >
                    + Add New Address
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No saved addresses</p>
                  <Button onClick={() => setShowAddAddress(true)}>Add Your First Address</Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2b: Add New Address */}
          {step === 2 && showAddAddress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label (e.g., Home, Office)</Label>
                <Input
                  id="label"
                  placeholder="Home"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  placeholder="123 Main Street, Apartment 4B"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  placeholder="Building name, Floor, etc."
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  placeholder="Near City Mall"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city_id">City *</Label>
                  <Select
                    value={addressForm.city_id}
                    onValueChange={(value) => setAddressForm({ ...addressForm, city_id: value })}
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
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="500001"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < addDays(new Date(), 2)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Select Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Services must be scheduled at least 48 hours (2 days) in advance
              </p>
            </div>
          )}

          {/* Step 4: Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or information for the service provider..."
                  value={notes}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      setNotes(e.target.value);
                    }
                  }}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {notes.length}/150 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pet</p>
                  <p className="font-medium">{pet.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">{phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Address</p>
                  {selectedAddress && (
                    <div>
                      <p className="font-medium">{selectedAddress.label || "Address"}</p>
                      <p className="text-sm">{selectedAddress.line1}</p>
                      {selectedAddress.line2 && <p className="text-sm">{selectedAddress.line2}</p>}
                      <p className="text-sm">
                        {selectedAddress.locality && `${selectedAddress.locality}, `}
                        {getCityName(selectedAddress.city_id)}
                        {selectedAddress.pincode && ` - ${selectedAddress.pincode}`}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
                  <p className="font-medium">
                    {selectedDate && format(selectedDate, "PPP")} at {selectedTime}
                  </p>
                </div>
                {notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">Estimated Price</p>
                  <p className="text-2xl font-bold">
                    {pricing.currency} {pricing.base_price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 && !showAddAddress}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext} disabled={createAddress.isPending}>
              {createAddress.isPending ? "Processing..." : "Next"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createServiceRequest.isPending}>
              {createServiceRequest.isPending ? "Submitting..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
