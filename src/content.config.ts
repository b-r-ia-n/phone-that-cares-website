import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tabs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/tabs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { tabs };
