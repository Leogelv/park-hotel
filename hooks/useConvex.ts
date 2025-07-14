"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Хуки для туров
export const useTours = (onlyActive = true, region?: string) => {
  return useQuery(api.tours.getAllTours, { onlyActive, region });
};

export const useTour = (id: Id<"tours">) => {
  return useQuery(api.tours.getTourById, { id });
};

export const useCreateTour = () => {
  return useMutation(api.tours.createTour);
};

export const useUpdateTour = () => {
  return useMutation(api.tours.updateTour);
};

export const useDeleteTour = () => {
  return useMutation(api.tours.deleteTour);
};

export const useRegions = () => {
  return useQuery(api.tours.getUniqueRegions);
};

// Хуки для пространств
export const useSpaces = (onlyAvailable = true, roomType?: string) => {
  return useQuery(api.spaces.getAllSpaces, { onlyAvailable, roomType });
};

export const useSpace = (id: Id<"spaces">) => {
  return useQuery(api.spaces.getSpaceById, { id });
};

export const useCreateSpace = () => {
  return useMutation(api.spaces.createSpace);
};

export const useUpdateSpace = () => {
  return useMutation(api.spaces.updateSpace);
};

export const useDeleteSpace = () => {
  return useMutation(api.spaces.deleteSpace);
};

export const useRoomTypes = () => {
  return useQuery(api.spaces.getRoomTypes);
};

export const useSpaceTypes = () => {
  return useQuery(api.spaces.getSpaceTypes);
};

// Хуки для доступности
export const useTourAvailability = (tourId: Id<"tours">) => {
  return useQuery(api.availability.getTourAvailability, { tour_id: tourId });
};

export const useCreateTourDate = () => {
  return useMutation(api.availability.createTourDate);
};

export const useUpdateTourOccupancy = () => {
  return useMutation(api.availability.updateTourOccupancy);
};

// Хуки для файлов
export const useFileUrl = (storageId: string | null) => {
  return useQuery(api.files.getFileUrl, storageId ? { storageId } : "skip");
};

export const useGenerateUploadUrl = () => {
  return useMutation(api.files.generateUploadUrl);
};

export const useDeleteFile = () => {
  return useMutation(api.files.deleteFile);
};