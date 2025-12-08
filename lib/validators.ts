import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email(),
  password: z.string().min(8),
  acceptTerms: z.boolean().refine((val) => val === true, 'Terms must be accepted')
});

export const mediaItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(['image', 'video']),
  order: z.number().int().nonnegative()
});

export const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().int().positive(),
  category: z.string().min(2),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).optional(),
  media: z.array(mediaItemSchema).optional()
});

export const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postal: z.string().min(3),
  country: z.string().min(2)
});

export const passwordResetSchema = z.object({
  email: z.string().email()
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
});
