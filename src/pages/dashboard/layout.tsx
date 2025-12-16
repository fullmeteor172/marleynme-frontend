import { Outlet, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Heart,
  Briefcase,
  Shield,
  User,
  MapPin,
  FileText,
  Phone,
  LogOut,
} from "lucide-react";
import Logo from "@/assets/logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DashboardLayout() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const isMobile = useIsMobile();

  const roles = profile?.roles || [];
  const isAdmin = roles.includes("admin_ops") || roles.includes("admin_super");
  const isPartner = roles.includes("service_partner");

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : profile?.email?.[0]?.toUpperCase() || "U";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b px-4 h-[56px] flex items-center">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8 flex-shrink-0" />
              <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Marley 'n' Me</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/dashboard/pets")}
                      isActive={location.pathname.startsWith("/dashboard/pets")}
                      className="data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300"
                    >
                      <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Your Pets Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/dashboard/adoption")}
                      isActive={location.pathname === "/dashboard/adoption"}
                      className="data-[active=true]:bg-pink-500/10 data-[active=true]:text-pink-700 dark:data-[active=true]:text-pink-300"
                    >
                      <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      <span>Adoption Center</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {isPartner && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate("/dashboard/partner")}
                        isActive={location.pathname === "/dashboard/partner"}
                        className="data-[active=true]:bg-purple-500/10 data-[active=true]:text-purple-700 dark:data-[active=true]:text-purple-300"
                      >
                        <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Partner Portal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate("/dashboard/admin")}
                        isActive={location.pathname === "/dashboard/admin"}
                        className="data-[active=true]:bg-red-500/10 data-[active=true]:text-red-700 dark:data-[active=true]:text-red-300"
                      >
                        <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Admin Portal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Account Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/dashboard/profile")}
                      isActive={location.pathname === "/dashboard/profile"}
                      className="data-[active=true]:bg-green-500/10 data-[active=true]:text-green-700 dark:data-[active=true]:text-green-300"
                    >
                      <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>User Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/dashboard/addresses")}
                      isActive={location.pathname === "/dashboard/addresses"}
                      className="data-[active=true]:bg-orange-500/10 data-[active=true]:text-orange-700 dark:data-[active=true]:text-orange-300"
                    >
                      <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span>Address Book</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Billing & Invoices</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Soon
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Support */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setShowContactDialog(true)}>
                      <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Contact Us</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-9 w-9 rounded-md group-data-[collapsible=icon]:rounded-md flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="font-medium truncate">
                  {profile?.first_name || "User"} {profile?.last_name || ""}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {profile?.email || user?.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
                className="group-data-[collapsible=icon]:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b p-4 h-[56px] flex items-center justify-between">
            <SidebarTrigger />
            <ModeToggle />
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Get in touch with the Marley 'n' Me team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <div className="font-medium">Email</div>
              <a
                href="mailto:itsmarleynme@gmail.com"
                className="text-primary hover:underline"
              >
                itsmarleynme@gmail.com
              </a>
            </div>
            <div>
              <div className="font-medium">Phone</div>
              <a href="tel:+917993260741" className="text-primary hover:underline">
                +91 7993260741
              </a>
            </div>
            <div>
              <div className="font-medium">Address</div>
              <p className="text-sm text-muted-foreground">
                Marley 'n' Me Pet Services
                <br />
                Hyderabad, India
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Dock Navigation */}
      {isMobile && (
        <div className="fixed bottom-4 left-0 right-0 z-50 md:hidden">
          <TooltipProvider>
            <Dock direction="middle" className="bg-background/80 dark:bg-background/90">
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/dashboard/pets")}
                      aria-label="Your Pets Home"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                        location.pathname.startsWith("/dashboard/pets") && "bg-blue-500/10"
                      )}
                    >
                      <Home className={cn(
                        "size-5",
                        location.pathname.startsWith("/dashboard/pets")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-muted-foreground"
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your Pets Home</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/dashboard/adoption")}
                      aria-label="Adoption Center"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                        location.pathname === "/dashboard/adoption" && "bg-pink-500/10"
                      )}
                    >
                      <Heart className={cn(
                        "size-5",
                        location.pathname === "/dashboard/adoption"
                          ? "text-pink-600 dark:text-pink-400"
                          : "text-muted-foreground"
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adoption Center</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              {isPartner && (
                <DockIcon>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigate("/dashboard/partner")}
                        aria-label="Partner Portal"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 rounded-full",
                          location.pathname === "/dashboard/partner" && "bg-purple-500/10"
                        )}
                      >
                        <Briefcase className={cn(
                          "size-5",
                          location.pathname === "/dashboard/partner"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-muted-foreground"
                        )} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Partner Portal</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              )}

              {isAdmin && (
                <DockIcon>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigate("/dashboard/admin")}
                        aria-label="Admin Portal"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 rounded-full",
                          location.pathname === "/dashboard/admin" && "bg-red-500/10"
                        )}
                      >
                        <Shield className={cn(
                          "size-5",
                          location.pathname === "/dashboard/admin"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        )} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Admin Portal</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              )}

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/dashboard/profile")}
                      aria-label="User Profile"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                        location.pathname === "/dashboard/profile" && "bg-green-500/10"
                      )}
                    >
                      <User className={cn(
                        "size-5",
                        location.pathname === "/dashboard/profile"
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>User Profile</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>

              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/dashboard/addresses")}
                      aria-label="Address Book"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                        location.pathname === "/dashboard/addresses" && "bg-orange-500/10"
                      )}
                    >
                      <MapPin className={cn(
                        "size-5",
                        location.pathname === "/dashboard/addresses"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-muted-foreground"
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Address Book</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            </Dock>
          </TooltipProvider>
        </div>
      )}
    </SidebarProvider>
  );
}
