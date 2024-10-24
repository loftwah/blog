// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
    }),
});

const guides = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
        category: z.string(),
        order: z.number().optional(), // For manual ordering of guides
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
        prerequisites: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, guides };