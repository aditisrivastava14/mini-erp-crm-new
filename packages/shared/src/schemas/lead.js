import { z } from 'zod';
import { LEAD_STATUS, LEAD_SOURCE } from '../constants/lead';
const statusValues = Object.values(LEAD_STATUS);
const sourceValues = Object.values(LEAD_SOURCE);
export const CreateLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    status: z.enum(statusValues).default(LEAD_STATUS.NEW),
    source: z.enum(sourceValues),
    notes: z.string().optional(),
    assignedTo: z.string().optional(), // User ID as string
});
export const UpdateLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    status: z.enum(statusValues).optional(),
    source: z.enum(sourceValues).optional(),
    notes: z.string().optional(),
    assignedTo: z.string().optional(),
});
