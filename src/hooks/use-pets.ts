import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '@/services/pet-service';
import type { CreatePetRequest } from '@/types';

export const usePets = () => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: petService.getPets,
  });
};

export const usePet = (petId: string) => {
  return useQuery({
    queryKey: ['pets', petId],
    queryFn: () => petService.getPet(petId),
    enabled: !!petId,
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePetRequest) => petService.createPet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useUpdatePet = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreatePetRequest>) => petService.updatePet(petId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', petId] });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petId: string) => petService.deletePet(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useUploadPetAvatar = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => petService.uploadAvatar(petId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', petId] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useGenerateShareCode = (petId: string) => {
  return useMutation({
    mutationFn: () => petService.generateShareCode(petId),
  });
};

export const useJoinWithCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => petService.joinWithCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useSpecies = () => {
  return useQuery({
    queryKey: ['species'],
    queryFn: petService.getSpecies,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useBreeds = (speciesId?: string) => {
  return useQuery({
    queryKey: ['breeds', speciesId],
    queryFn: () => petService.getBreeds(speciesId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!speciesId,
  });
};
