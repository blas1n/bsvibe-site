import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	blog: defineCollection({
		loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			author: z.string().default('BSVibe Team'),
			tags: z.array(z.string()).default([]),
			locale: z.enum(['ko', 'en']).default('ko'),
			draft: z.boolean().default(false),
			image: z.string().optional(),
		}),
	}),
};
