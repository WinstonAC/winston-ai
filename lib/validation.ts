import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

// User validation schemas
export const userSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// Lead validation schemas
export const leadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  status: z.enum(['Pending', 'Contacted', 'Qualified', 'Unqualified']),
  userId: z.string().uuid(),
});

// Team validation schemas
export const teamSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
});

// Campaign validation schemas
export const campaignSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  teamId: z.string().uuid(),
});

// Validation function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
}

// API validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      return validateInput(schema, body);
    } catch (error) {
      throw new Error('Invalid request data');
    }
  };
} 