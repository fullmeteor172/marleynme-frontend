import { api } from '@/lib/api';
import type { Pet, CreatePetRequest, Species, Breed, PetShareCode, PetMedicalFile } from '@/types';

export const petService = {
  getPets: () => api.get<Pet[]>('/pets'),

  getPet: (petId: string) => api.get<Pet>(`/pets/${petId}`),

  createPet: (data: CreatePetRequest) => api.post<Pet>('/pets', data),

  updatePet: (petId: string, data: Partial<CreatePetRequest>) =>
    api.patch<Pet>(`/pets/${petId}`, data),

  deletePet: (petId: string) => api.delete<Pet>(`/pets/${petId}`),

  uploadAvatar: (petId: string, file: File) =>
    api.uploadFile<Pet>(`/pets/${petId}/avatar`, file),

  generateShareCode: (petId: string) =>
    api.post<PetShareCode>(`/pets/${petId}/share-codes`),

  joinWithCode: (code: string) =>
    api.post<Pet>('/pets/join', { code }),

  getMedicalFiles: (petId: string) =>
    api.get<PetMedicalFile[]>(`/pets/${petId}/medical-files`),

  uploadMedicalFile: (petId: string, file: File, notes?: string) =>
    api.uploadFile<PetMedicalFile>(
      `/pets/${petId}/medical-files`,
      file,
      notes ? { notes } : undefined
    ),

  getSpecies: () => api.get<Species[]>('/pets/reference/species'),

  getBreeds: (speciesId?: string) => {
    const endpoint = speciesId
      ? `/pets/reference/breeds?species_id=${speciesId}`
      : '/pets/reference/breeds';
    return api.get<Breed[]>(endpoint);
  },
};
