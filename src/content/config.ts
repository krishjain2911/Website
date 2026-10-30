import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    code: z.string(),
    order: z.number(),
    pillar: z.enum(['Engineer', 'Gen-AI', 'Build', 'Intelligence']),
    badge: z.enum(['High-code', 'OutSystems', 'High-code (MERN)']),
    oneLiner: z.string(),
    outcomeHeadline: z.string(),
    problem: z.string(),
    painPoints: z.array(z.string()).default([]),
    howItWorks: z.array(z.object({
      step: z.string(),
      title: z.string(),
      description: z.string()
    })),
    value: z.string(),
    demoMedia: z.object({
      posterText: z.string(),
      badgeText: z.string().default('Demo video coming soon'),
      caption: z.string(),
      videoUrl: z.string().optional()
    }),
    features: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).default([]),
    audiences: z.array(z.string()).default([]),
    builtWith: z.string(),
    builtWithReason: z.string(),
    beforeAfterId: z.enum(['clm', 'dms', 'whatsapp']).optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([]),
    related: z.array(z.string()).default([]),
    ctaText: z.string().default('Book a demo')
  })
});

export const collections = {
  products
};
