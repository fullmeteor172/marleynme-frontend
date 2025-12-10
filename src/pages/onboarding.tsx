import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  useUpdateProfile,
  useAddRole,
  useCompleteOnboarding,
  useCities,
} from "@/hooks/use-profile";
import { useServices } from "@/hooks/use-services";
import { partnerService } from "@/services/partner-service";
import type { ProfileRole } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { ChevronLeft, LogOut } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface OnboardingData {
  firstName: string;
  lastName: string;
  cityId: string;
  roles: ProfileRole[];
  phone: string;
  pincode: string;
  serviceIds: string[];
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useAuthStore((state) => state.profile);

  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to strip +91 prefix from phone if present
  const stripPhonePrefix = (phone: string) => {
    if (phone.startsWith("+91")) {
      return phone.substring(3);
    }
    return phone;
  };

  const [data, setData] = useState<OnboardingData>({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    cityId: profile?.city_id || "",
    roles: [],
    phone: stripPhonePrefix(profile?.phone || ""),
    pincode: profile?.pincode || "",
    serviceIds: [],
  });

  const { data: cities } = useCities();
  const { data: services } = useServices();
  const updateProfile = useUpdateProfile();
  const addRole = useAddRole();
  const completeOnboarding = useCompleteOnboarding();

  const totalSteps = data.roles.includes("service_partner") ? 6 : 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (step === 1) {
        if (!data.firstName.trim()) {
          toast.error("Please enter your first name");
          setIsProcessing(false);
          return;
        }
        await updateProfile.mutateAsync({
          first_name: data.firstName,
          last_name: data.lastName || undefined,
        });
        setStep(2);
      } else if (step === 2) {
        if (!data.cityId) {
          toast.error("Please select a city");
          setIsProcessing(false);
          return;
        }
        await updateProfile.mutateAsync({ city_id: data.cityId });
        setStep(3);
      } else if (step === 3) {
        if (data.roles.length === 0) {
          toast.error("Please select at least one option");
          setIsProcessing(false);
          return;
        }
        // Add all roles sequentially
        for (const role of data.roles) {
          await addRole.mutateAsync(role);
        }

        if (!data.roles.includes("service_partner")) {
          // Complete onboarding for non-service-partners
          await completeOnboarding.mutateAsync();
          // Wait a bit for queries to invalidate and refetch
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate("/dashboard", { replace: true });
        } else {
          setStep(4);
        }
      } else if (step === 4) {
        if (!data.phone || data.phone.length !== 10) {
          toast.error("Please enter a valid 10-digit phone number");
          setIsProcessing(false);
          return;
        }
        await updateProfile.mutateAsync({ phone: `+91${data.phone}` });
        setStep(5);
      } else if (step === 5) {
        // Save service interests if any selected
        if (data.serviceIds.length > 0) {
          for (const serviceId of data.serviceIds) {
            await partnerService.addInterest(serviceId);
          }
        }
        setStep(6);
      } else if (step === 6) {
        // Can skip pincode
        if (data.pincode) {
          await updateProfile.mutateAsync({ pincode: data.pincode });
        }
        await completeOnboarding.mutateAsync();
        // Wait a bit for queries to invalidate and refetch
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (step > 1 && !isProcessing) {
      setStep((step - 1) as Step);
    }
  };

  const toggleRole = (role: ProfileRole) => {
    setData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const toggleService = (serviceId: string) => {
    setData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 right-0 p-4 flex items-center gap-3 z-50">
        <ModeToggle />
        <Button
          variant="outline"
          size="icon"
          onClick={() => signOut()}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Hey there! What's your name?
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Michael"
                    value={data.firstName}
                    onChange={(e) =>
                      setData({ ...data, firstName: e.target.value })
                    }
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Jackson"
                    value={data.lastName}
                    onChange={(e) =>
                      setData({ ...data, lastName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: City */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                Hi {data.firstName}! Which city are you in?
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cities?.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setData({ ...data, cityId: city.id })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      data.cityId === city.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{city.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {city.state}, {city.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Roles */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                {data.firstName}, what best describes you?
              </h1>
              <p className="text-muted-foreground">Select all that apply</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => toggleRole("pet_parent")}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    data.roles.includes("pet_parent")
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-lg">Pet Parent</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I have pets and need care services
                  </div>
                </button>

                <button
                  onClick={() => toggleRole("prospective_parent")}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    data.roles.includes("prospective_parent")
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-lg">
                    I want to adopt pets
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Looking to adopt a furry friend
                  </div>
                </button>

                <button
                  onClick={() => toggleRole("service_partner")}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    data.roles.includes("service_partner")
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-lg">
                    Pet Service Provider
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I provide pet care services
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Phone (Service Partners only) */}
          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                What's your contact number?
              </h1>
              <div className="max-w-md">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex gap-2 mt-2">
                  <div className="flex items-center gap-2 px-3 border rounded-md bg-muted text-sm font-medium h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className="w-6 h-4 flex-shrink-0">
                      <rect width="36" height="24" fill="#FF9933"/>
                      <rect width="36" height="16" y="8" fill="#fff"/>
                      <rect width="36" height="8" y="16" fill="#138808"/>
                      <circle cx="18" cy="12" r="3" fill="#000080"/>
                      <circle cx="18" cy="12" r="2.5" fill="transparent" stroke="#000080" strokeWidth="0.4"/>
                      <g transform="translate(18, 12)">
                        {[...Array(24)].map((_, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="-2.5"
                            stroke="#000080"
                            strokeWidth="0.15"
                            transform={`rotate(${i * 15})`}
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
                    value={data.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setData({ ...data, phone: value });
                      }
                    }}
                    className="flex-1"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Services (Service Partners only) */}
          {step === 5 && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                What services are you interested in?
              </h1>
              <p className="text-muted-foreground">
                Select all that apply (you can skip this)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services?.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      data.serviceIds.includes(service.id)
                        ? "border-green-600 bg-green-600/10"
                        : "border-border hover:border-green-600/50"
                    }`}
                  >
                    <div className="font-semibold">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Pincode (Service Partners only) */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  What is your pincode?
                </h1>
                <p className="text-muted-foreground mt-2">
                  <span className="text-xs uppercase tracking-wide">Optional</span>
                </p>
              </div>
              <div className="max-w-xs">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="560001"
                  value={data.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setData({ ...data, pincode: value });
                    }
                  }}
                  className="mt-2"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isProcessing}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {((step === 5 && data.roles.includes("service_partner")) ||
              (step === 6 && data.roles.includes("service_partner"))) && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (isProcessing) return;
                  setIsProcessing(true);
                  try {
                    await completeOnboarding.mutateAsync();
                    // Wait a bit for queries to invalidate and refetch
                    await new Promise(resolve => setTimeout(resolve, 500));
                    navigate("/dashboard", { replace: true });
                  } catch (error) {
                    toast.error("Failed to complete onboarding");
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isProcessing}
            >
              {isProcessing ? "Saving..." : step === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
