import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/address-service";
import type { CreateAddressRequest, PetAddressUsage } from "@/types";

export const useAddresses = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.getAddresses,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressRequest) =>
      addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: Partial<CreateAddressRequest>;
    }) => addressService.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressService.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useLinkPetToAddress = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      usage,
      isPrimary,
    }: {
      addressId: string;
      usage: PetAddressUsage;
      isPrimary?: boolean;
    }) => addressService.linkPetToAddress(petId, addressId, usage, isPrimary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-addresses", petId] });
    },
  });
};
