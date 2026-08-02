import { z } from "zod";

/** Esquemas compartidos por las pantallas que cargan archivos al proxy interno. */
export const uploadInputSchema = z.object({
  file: z.instanceof(File),
  metadata: z.record(z.string(), z.unknown()).default({}),
  processImage: z.boolean().default(false),
  processAudio: z.boolean().default(false),
  duplicatePolicy: z.enum(["reuse", "reject", "new_copy"]).default("reuse"),
});

export const processedFileSchema = z.object({
  key: z.string(),
  url: z.string().url(),
  content_type: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const fileProcessingJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  kind: z.string(),
});

export const fileServiceResponseSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string(),
  filename: z.string(),
  content_type: z.string(),
  size: z.number().nonnegative(),
  sha256: z.string().length(64),
  key: z.string(),
  url: z.string().url(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  duplicate: z.boolean(),
  processed: processedFileSchema.optional(),
  jobs: z.array(fileProcessingJobSchema).optional(),
});

export type UploadedFile = z.infer<typeof fileServiceResponseSchema>;
