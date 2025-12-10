import { Outlet } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

export function DashboardLayout() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [showContactDialog, setShowContactDialog] = useState(false);

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
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-semibold">Marley 'n' Me</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/pets")}>
                      <Home className="w-4 h-4" />
                      <span>Your Pets Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/adoption")}>
                      <Heart className="w-4 h-4" />
                      <span>Adoption Center</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {isPartner && (
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => navigate("/dashboard/partner")}>
                        <Briefcase className="w-4 h-4" />
                        <span>Partner Portal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => navigate("/dashboard/admin")}>
                        <Shield className="w-4 h-4" />
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
                    <SidebarMenuButton onClick={() => navigate("/dashboard/profile")}>
                      <User className="w-4 h-4" />
                      <span>User Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/dashboard/addresses")}>
                      <MapPin className="w-4 h-4" />
                      <span>Address Book</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <FileText className="w-4 h-4" />
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
                      <Phone className="w-4 h-4" />
                      <span>Contact Us</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
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
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b p-4">
            <SidebarTrigger />
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
                href="mailto:support@marleynme.in"
                className="text-primary hover:underline"
              >
                support@marleynme.in
              </a>
            </div>
            <div>
              <div className="font-medium">Phone</div>
              <a href="tel:+911234567890" className="text-primary hover:underline">
                +91 123 456 7890
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
    </SidebarProvider>
  );
}
