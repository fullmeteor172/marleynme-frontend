import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Navigate } from 'react-router-dom';
import {
  useAdminUsers,
  useAdminServiceRequests,
  useUpdateAdminServiceRequest,
  useCreateCity,
  useUpdateCity,
  useCreateSpecies,
  useUpdateSpecies,
  useCreateBreed,
  useUpdateBreed,
  useCreateService,
  useUpdateService,
  useAddUserRole,
  useRemoveUserRole,
} from '@/hooks/use-admin';
import { useServices, useServicePricing } from '@/hooks/use-services';
import { useSpecies, useBreeds } from '@/hooks/use-pets';
import { useCities } from '@/hooks/use-profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Calendar,
  MapPin,
  PawPrint,
  Briefcase,
  Plus,
  Edit,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Profile, ServiceRequest, City, Species, Breed, Service, ProfileRole } from '@/types';

// Status color helpers
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending_assignment: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    assigned: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    upcoming: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    in_progress: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    awaiting_completion: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    completed: 'bg-green-500/10 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
};

const formatStatus = (status: string) =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Users Management Tab
function UsersTab() {
  const { data: users, isLoading, refetch } = useAdminUsers();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const allRoles: ProfileRole[] = ['pet_parent', 'prospective_parent', 'service_partner', 'admin_ops', 'admin_super'];

  const handleAddRole = async (role: ProfileRole) => {
    if (!selectedUser) return;
    try {
      await addRole.mutateAsync({ userId: selectedUser.user_id, role });
      toast.success(`Added ${role} role`);
      setRoleDialogOpen(false);
      refetch();
    } catch {
      toast.error('Failed to add role');
    }
  };

  const handleRemoveRole = async (userId: string, role: ProfileRole) => {
    try {
      await removeRole.mutateAsync({ userId, role });
      toast.success(`Removed ${role} role`);
      refetch();
    } catch {
      toast.error('Failed to remove role');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Users ({users?.length || 0})</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Email</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Phone</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Roles</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Onboarded</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user, index) => (
                <TableRow key={user.user_id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                  <TableCell className="py-3 px-4 font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">{user.phone || '-'}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/20"
                          onClick={() => handleRemoveRole(user.user_id, role)}
                        >
                          {role.replace('_', ' ')}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {user.onboarding_completed_at ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setRoleDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Add a role to {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {allRoles
              .filter((role) => !selectedUser?.roles?.includes(role))
              .map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleAddRole(role)}
                  disabled={addRole.isPending}
                >
                  {role.replace('_', ' ')}
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Service Requests Tab
function ServiceRequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: requests, isLoading, refetch } = useAdminServiceRequests(statusFilter || undefined);
  const { data: allServices } = useServices();
  const updateRequest = useUpdateAdminServiceRequest();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    try {
      await updateRequest.mutateAsync({
        requestId: selectedRequest.id,
        data: { status: newStatus, admin_notes: adminNotes || undefined },
      });
      toast.success('Request updated');
      setUpdateDialogOpen(false);
      refetch();
    } catch {
      toast.error('Failed to update request');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading service requests...</div>;
  }

  const statuses = [
    'pending_assignment',
    'assigned',
    'upcoming',
    'in_progress',
    'awaiting_completion',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold">Service Requests ({requests?.length || 0})</h3>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Service</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Customer</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Price</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request, index) => {
                const service = allServices?.find((s) => s.id === request.service_id);
                return (
                  <TableRow key={request.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                    <TableCell className="py-3 px-4 font-medium">{service?.name || 'Unknown'}</TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground">{request.customer_contact_phone}</TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(request.requested_datetime), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                        {formatStatus(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-semibold">
                      {request.currency === 'INR' ? '₹' : request.currency}{' '}
                      {request.estimated_price.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setNewStatus(request.status);
                          setAdminNotes(request.admin_notes || '');
                          setUpdateDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Input
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateRequest.isPending}>
              {updateRequest.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reference Data - Cities Tab
function CitiesTab() {
  const { data: cities, isLoading, refetch } = useCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ name: '', state: '', country: 'India', is_active: true });

  const handleSubmit = async () => {
    try {
      if (editingCity) {
        await updateCity.mutateAsync({ cityId: editingCity.id, data: formData });
        toast.success('City updated');
      } else {
        await createCity.mutateAsync(formData);
        toast.success('City created');
      }
      setDialogOpen(false);
      setEditingCity(null);
      setFormData({ name: '', state: '', country: 'India', is_active: true });
      refetch();
    } catch {
      toast.error('Failed to save city');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading cities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cities ({cities?.length || 0})</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingCity(null);
            setFormData({ name: '', state: '', country: 'India', is_active: true });
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add City
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">State</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Country</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities?.map((city, index) => (
                <TableRow key={city.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                  <TableCell className="py-3 px-4 font-medium">{city.name}</TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">{city.state}</TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">{city.country}</TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge variant={city.is_active ? 'default' : 'secondary'}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCity(city);
                        setFormData({
                          name: city.name,
                          state: city.state,
                          country: city.country,
                          is_active: city.is_active,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? 'Edit City' : 'Add City'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="City name"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createCity.isPending || updateCity.isPending}>
              {editingCity ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reference Data - Species Tab
function SpeciesTab() {
  const { data: species, isLoading, refetch } = useSpecies();
  const createSpecies = useCreateSpecies();
  const updateSpecies = useUpdateSpecies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);
  const [formData, setFormData] = useState({ name: '', is_active: true });

  const handleSubmit = async () => {
    try {
      if (editingSpecies) {
        await updateSpecies.mutateAsync({ speciesId: editingSpecies.id, data: formData });
        toast.success('Species updated');
      } else {
        await createSpecies.mutateAsync(formData);
        toast.success('Species created');
      }
      setDialogOpen(false);
      setEditingSpecies(null);
      setFormData({ name: '', is_active: true });
      refetch();
    } catch {
      toast.error('Failed to save species');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading species...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Species ({species?.length || 0})</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingSpecies(null);
            setFormData({ name: '', is_active: true });
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Species
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {species?.map((s, index) => (
                <TableRow key={s.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                  <TableCell className="py-3 px-4 font-medium">{s.name}</TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge variant={s.is_active ? 'default' : 'secondary'}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSpecies(s);
                        setFormData({ name: s.name, is_active: s.is_active });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSpecies ? 'Edit Species' : 'Add Species'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Species name"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_species"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active_species">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createSpecies.isPending || updateSpecies.isPending}>
              {editingSpecies ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reference Data - Breeds Tab
function BreedsTab() {
  const { data: breeds, isLoading, refetch } = useBreeds();
  const { data: species } = useSpecies();
  const createBreed = useCreateBreed();
  const updateBreed = useUpdateBreed();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [formData, setFormData] = useState({ name: '', species_id: '', is_active: true });

  const handleSubmit = async () => {
    try {
      if (editingBreed) {
        await updateBreed.mutateAsync({ breedId: editingBreed.id, data: { name: formData.name, is_active: formData.is_active } });
        toast.success('Breed updated');
      } else {
        await createBreed.mutateAsync(formData);
        toast.success('Breed created');
      }
      setDialogOpen(false);
      setEditingBreed(null);
      setFormData({ name: '', species_id: '', is_active: true });
      refetch();
    } catch {
      toast.error('Failed to save breed');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading breeds...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Breeds ({breeds?.length || 0})</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingBreed(null);
            setFormData({ name: '', species_id: '', is_active: true });
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Breed
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Species</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breeds?.map((breed, index) => {
                const breedSpecies = species?.find((s) => s.id === breed.species_id);
                return (
                  <TableRow key={breed.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                    <TableCell className="py-3 px-4 font-medium">{breed.name}</TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground">{breedSpecies?.name || '-'}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant={breed.is_active ? 'default' : 'secondary'}>
                        {breed.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBreed(breed);
                          setFormData({ name: breed.name, species_id: breed.species_id, is_active: breed.is_active });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBreed ? 'Edit Breed' : 'Add Breed'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Breed name"
              />
            </div>
            {!editingBreed && (
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={formData.species_id} onValueChange={(v) => setFormData({ ...formData, species_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {species?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_breed"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active_breed">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createBreed.isPending || updateBreed.isPending}>
              {editingBreed ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reference Data - Services Tab
function ServicesTab() {
  const { data: services, isLoading, refetch } = useServices();
  const { data: pricing } = useServicePricing();
  const { data: species } = useSpecies();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '', is_active: true });

  const handleSubmit = async () => {
    try {
      if (editingService) {
        await updateService.mutateAsync({ serviceId: editingService.id, data: formData });
        toast.success('Service updated');
      } else {
        await createService.mutateAsync(formData);
        toast.success('Service created');
      }
      setDialogOpen(false);
      setEditingService(null);
      setFormData({ code: '', name: '', description: '', is_active: true });
      refetch();
    } catch {
      toast.error('Failed to save service');
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services ({services?.length || 0})</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingService(null);
            setFormData({ code: '', name: '', description: '', is_active: true });
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Code</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Description</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Pricing</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Status</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide h-10 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((service, index) => {
                const servicePricing = pricing?.filter((p) => p.service_id === service.id) || [];
                return (
                  <TableRow key={service.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                    <TableCell className="py-3 px-4 font-mono text-sm">{service.code}</TableCell>
                    <TableCell className="py-3 px-4 font-medium">{service.name}</TableCell>
                    <TableCell className="py-3 px-4 text-muted-foreground text-sm max-w-xs truncate">
                      {service.description || '-'}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {servicePricing.map((p) => {
                          const sp = species?.find((s) => s.id === p.species_id);
                          return (
                            <Badge key={p.id} variant="outline" className="text-xs">
                              {sp?.name}: {p.currency === 'INR' ? '₹' : p.currency}
                              {p.base_price.toLocaleString()}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingService(service);
                          setFormData({
                            code: service.code,
                            name: service.name,
                            description: service.description || '',
                            is_active: service.is_active,
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SERVICE_CODE"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Service name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Service description"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_service"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active_service">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createService.isPending || updateService.isPending}>
              {editingService ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main Admin Portal Page
export function AdminPortalPage() {
  const { profile } = useAuthStore();
  const roles = profile?.roles || [];
  const isAdmin = roles.includes('admin_ops') || roles.includes('admin_super');

  // Redirect non-admins
  if (!isAdmin) {
    return <Navigate to="/dashboard/pets" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          Admin Portal
        </h1>
        <p className="text-muted-foreground mt-1">System administration and management</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto flex-wrap">
              <TabsTrigger
                value="users"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Service Requests
              </TabsTrigger>
              <TabsTrigger
                value="cities"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Cities
              </TabsTrigger>
              <TabsTrigger
                value="species"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <PawPrint className="w-4 h-4 mr-2" />
                Species
              </TabsTrigger>
              <TabsTrigger
                value="breeds"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <PawPrint className="w-4 h-4 mr-2" />
                Breeds
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Services
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="users" className="mt-0">
                <UsersTab />
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                <ServiceRequestsTab />
              </TabsContent>

              <TabsContent value="cities" className="mt-0">
                <CitiesTab />
              </TabsContent>

              <TabsContent value="species" className="mt-0">
                <SpeciesTab />
              </TabsContent>

              <TabsContent value="breeds" className="mt-0">
                <BreedsTab />
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <ServicesTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
