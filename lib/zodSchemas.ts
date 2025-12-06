import { z } from "zod";

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.number().min(1),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.string().min(1, "Sub Category is required"),
  mainCategory: z.enum(["MEN", "WOMEN", "KIDS"]),
  isFeatured: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).default(0),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

export const bannerSchema = z.object({
  title: z.string(),
  imageString: z.string(),
});

export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"), // You might want to use specific country codes
  phone: z.string().optional(),
});