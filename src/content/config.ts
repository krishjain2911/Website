import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    code: z.string(),
    order: z.number(),
    pillar: z.enum(['Engineer', 'Gen-AI', 'Build', 'Intelligence']),
    badge: z.string().default('High-code'),
    badges: z.array(z.string()).optional(),
    seoDescription: z.string().optional(),
    oneLiner: z.string(),
    outcomeHeadline: z.string(),
    problem: z.string(),
    builtExamples: z.array(z.object({
      name: z.string(),
      oneLiner: z.string(),
      deployedFor: z.string(),
      stack: z.string()
    })).default([]),
    whatWeBuilt: z.string().optional(),
    painPoints: z.array(z.string()).default([]),
    howItWorks: z.array(z.object({
      step: z.string(),
      title: z.string(),
      description: z.string()
    })).default([]),
    value: z.string().default(''),
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
    hideAudienceStack: z.boolean().default(false).optional(),
    focus: z.string().default('center').optional(),
    imageKey: z.string().optional(),
    interfaceScreens: z.array(z.object({
      step: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      badge: z.string().optional(),
      statusText: z.string().optional(),
      image: z.string(),
      alt: z.string()
    })).optional(),
    audiences: z.array(z.string()).default([]),
    builtWith: z.string().optional(),
    builtWithReason: z.string().optional(),
    techStackPills: z.array(z.string()).default([]),
    makeItYours: z.object({
      headline: z.string(),
      subline: z.string().optional(),
      description: z.string().optional(),
      useCases: z.array(z.object({
        title: z.string(),
        description: z.string()
      })).default([]),
      closing: z.string().optional()
    }).optional(),
    beforeAfterId: z.enum(['clm', 'dms', 'whatsapp']).optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([]),
    related: z.array(z.string()).default([]),
    ctaText: z.string().default("Let's talk")
  })
});

export const collections = {
  products
};
