import { z } from "zod";

/**
 * Esquema base para los audios de la fonoteca
 */
export const AudioSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  scientificName: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string(),
  }),
  recordedAt: z.date(),
  fileUrl: z.string().url(),
  duration: z.number(), // en segundos
});

export type Audio = z.infer<typeof AudioSchema>;

/**
 * Esquema para usuarios/administradores
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]),
});

export type User = z.infer<typeof UserSchema>;

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export * from "./species";
