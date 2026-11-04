import { defineCollection, z } from 'astro:content';

export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video', 'gif', 'embed']),
  src: z.string(),
  poster: z.string().optional(),
  alt: z.string().default(''),
  caption: z.string().optional(),
  frame: z.enum(['browser', 'phone', 'none']).default('none').optional()
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

const basePhaseSchema = z.object({
  headline: z.string().optional(),
  story: z.string().optional(),
  points: z.array(z.string()).default([]),
  media: z.array(mediaItemSchema).default([])
});

const problemPhaseSchema = basePhaseSchema.extend({
  process: z.array(z.string()).default([]),
  friction: z.array(z.object({
    title: z.string(),
    detail: z.string()
  })).default([])
});

const valuePhaseSchema = basePhaseSchema.extend({
  metrics: z.array(z.object({
    label: z.string(),
    before: z.string().optional(),
    after: z.string().optional(),
    note: z.string().optional()
  })).default([]),
  levers: z.array(z.string()).default([])
});

const architecturePhaseSchema = basePhaseSchema.extend({
  layers: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      name: z.string(),
      role: z.string()
    })).default([])
  })).default([]),
  pattern: z.string().optional(),
  ai: z.array(z.string()).default([]),
  security: z.string().optional()
});

const pilotPhaseSchema = basePhaseSchema.extend({
  scope: z.object({
    who: z.string().optional(),
    where: z.string().optional(),
    duration: z.string().optional()
  }).optional(),
  feedback: z.array(z.object({
    heard: z.string(),
    changed: z.string()
  })).default([])
});

const rolloutPhaseSchema = basePhaseSchema.extend({
  hardening: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  scale: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).default([])
});

const impactPhaseSchema = basePhaseSchema.extend({
  enablement: z.array(z.string()).default([]),
  governance: z.array(z.string()).default([]),
  monitoring: z.array(z.string()).default([]),
  outcome: z.string().optional(),
  quote: z.object({
    text: z.string(),
    role: z.string()
  }).optional()
});

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
    featured: z.boolean().default(false).optional(),
    image: z.string().optional(),
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
    ctaText: z.string().default("Let's talk"),

    // New 6-Phase Journey Fields (all optional for smooth backward-compatibility)
    status: z.enum(['Deployed', 'Accelerator']).optional(),
    client: z.string().optional(),
    timeline: z.string().optional(),
    outcomes: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).max(3).default([]),
    hero: mediaItemSchema.optional(),

    phases: z.object({
      problem: problemPhaseSchema.optional(),
      value: valuePhaseSchema.optional(),
      architecture: architecturePhaseSchema.optional(),
      pilot: pilotPhaseSchema.optional(),
      rollout: rolloutPhaseSchema.optional(),
      impact: impactPhaseSchema.optional()
    }).optional()
  })
});

export const collections = {
  products
};
