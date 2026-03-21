import type { z } from 'zod';

export function parseSocketPayload<Schema extends z.ZodType>(
  schema: Schema,
  payload: unknown,
): { ok: true; data: z.infer<Schema> } | { ok: false; error: string } {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid payload';
    return { ok: false, error: message };
  }
  return { ok: true, data: result.data };
}
