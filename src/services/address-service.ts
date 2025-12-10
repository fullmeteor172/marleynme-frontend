import { api } from '@/lib/api';
import type { Address, CreateAddressRequest, PetAddress, PetAddressUsage } from '@/types';

export const addressService = {
  getAddresses: () => api.get<Address[]>('/addresses'),

  getAddress: (addressId: string) => api.get<Address>(`/addresses/${addressId}`),

  createAddress: (data: CreateAddressRequest) =>
    api.post<Address>('/addresses', data),

  updateAddress: (addressId: string, data: Partial<CreateAddressRequest>) =>
    api.patch<Address>(`/addresses/${addressId}`, data),

  deleteAddress: (addressId: string) =>
    api.delete<Address>(`/addresses/${addressId}`),

  linkPetToAddress: (petId: string, addressId: string, usage: PetAddressUsage, isPrimary: boolean = false) =>
    api.post<PetAddress>(`/addresses/pets/${petId}`, {
      address_id: addressId,
      usage,
      is_primary: isPrimary,
    }),

  getPetAddresses: (petId: string) =>
    api.get<PetAddress[]>(`/addresses/pets/${petId}`),
};
