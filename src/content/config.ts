import { defineCollection, z } from 'astro:content';

// The §6 developer contract from docs/playbooks-design-spec.md, enforced at
// build time: bad frontmatter fails the build, which fails CI.

const concerns = [
  'tracking', 'data-collection', 'account-takeover', 'stalkerware',
  'device-loss', 'travel', 'kids', 'scams-phishing', 'network-privacy',
  'new-phone',
] as const;

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    concepts: z.array(z.enum(['security', 'privacy', 'trust', 'identity', 'anonymity'])),
    concerns: z.array(z.enum(concerns)).min(1),
    reading_minutes: z.number().int().positive(),
    published: z.date(),
    updated: z.date(),
    sources: z.array(z.object({
      title: z.string(),
      outlet: z.string(),
      url: z.string().url(),
      date: z.date(),
    })).default([]),
  }),
});

const playbooks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    platform: z.enum(['ios', 'android', 'grapheneos', 'universal']),
    concerns: z.array(z.enum(concerns)).min(1),
    difficulty: z.enum(['warmup', 'fundamentals', 'advanced']),
    time_minutes: z.number().int().positive(),
    os_verified: z.string(),
    verified_date: z.date(),
    plays: z.number().int().positive(),
    related_article: z.string().optional(),
  }),
});

export const collections = { articles, playbooks };
