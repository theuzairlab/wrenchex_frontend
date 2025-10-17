import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Role selection schema
export const roleSelectionSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']),
});

// Base user registration schema
export const baseRegisterSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  phone: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return /^\+?[1-9]\d{1,14}$/.test(value);
    }, 'Please enter a valid phone number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Buyer registration schema (extends base)
export const buyerRegisterSchema = baseRegisterSchema.extend({
  role: z.literal('BUYER'),
});

// Seller registration schema (extends base with business info)
export const sellerRegisterSchema = baseRegisterSchema.extend({
  role: z.literal('SELLER'),
  shopName: z
    .string()
    .min(1, 'Shop name is required')
    .min(2, 'Shop name must be at least 2 characters')
    .max(100, 'Shop name must be less than 100 characters'),
  shopAddress: z
    .string()
    .min(1, 'Shop address is required')
    .min(10, 'Please provide a complete address')
    .max(500, 'Address must be less than 500 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must be less than 50 characters'),
  area: z
    .string()
    .min(1, 'Area is required')
    .min(2, 'Area name must be at least 2 characters')
    .max(50, 'Area name must be less than 50 characters'),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  businessType: z
    .string()
    .min(1, 'Business type is required')
    .max(100, 'Business type must be less than 100 characters'),
  shopRole: z
    .string()
    .min(1, 'Shop role is required')
    .refine((value) => ['shop_owner', 'manager', 'mechanic', 'technician', 'sales_representative', 'other'].includes(value), {
      message: 'Please select a valid shop role'
    }),
  customShopRole: z
    .string()
    .optional(),
  description: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return value.length <= 1000;
    }, 'Description must be less than 1000 characters'),
}).superRefine((data, ctx) => {
  // Custom validation for customShopRole when shopRole is 'other'
  if (data.shopRole === 'other') {
    if (!data.customShopRole || data.customShopRole.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom shop role is required when "Other" is selected',
        path: ['customShopRole'],
      });
    } else if (data.customShopRole.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom shop role must be at least 2 characters',
        path: ['customShopRole'],
      });
    } else if (data.customShopRole.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom shop role must be less than 50 characters',
        path: ['customShopRole'],
      });
    }
  }
});

// Combined registration schema (union of buyer and seller)
export const registerSchema = z.discriminatedUnion('role', [
  buyerRegisterSchema,
  sellerRegisterSchema,
]);

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Password reset schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Type definitions for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RoleSelectionFormData = z.infer<typeof roleSelectionSchema>;
export type BaseRegisterFormData = z.infer<typeof baseRegisterSchema>;
export type BuyerRegisterFormData = z.infer<typeof buyerRegisterSchema>;
export type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// Business type options for sellers
export const businessTypeOptions = [
  { value: 'auto_parts', label: 'Auto Parts Store' },
  { value: 'mechanic_shop', label: 'Mechanic Shop' },
  { value: 'tire_shop', label: 'Tire Shop' },
  { value: 'body_shop', label: 'Body Shop' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'oil_change', label: 'Oil Change Service' },
  { value: 'dealership', label: 'Car Dealership' },
  { value: 'towing', label: 'Towing Service' },
  { value: 'mobile_mechanic', label: 'Mobile Mechanic' },
  { value: 'other', label: 'Other' },
] as const;

// Shop role options for sellers
export const shopRoleOptions = [
  { value: 'shop_owner', label: 'Shop Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'technician', label: 'Technician' },
  { value: 'sales_representative', label: 'Sales Representative' },
  { value: 'other', label: 'Other' },
] as const; 