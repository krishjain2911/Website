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
  tagline: z.string().optional(),
  headline: z.string().optional(),
  story: z.string().optional(),
  points: z.array(z.string()).default([]),
  media: z.array(mediaItemSchema).default([])
}).passthrough();

const problemPhaseSchema = basePhaseSchema.extend({
  process: z.array(z.string()).default([]),
  friction: z.array(z.object({
    title: z.string(),
    detail: z.string()
  })).default([])
}).passthrough();

const valuePhaseSchema = basePhaseSchema.extend({
  metrics: z.array(z.object({
    label: z.string(),
    before: z.string().optional(),
    after: z.string().optional(),
    note: z.string().optional()
  })).default([]),
  levers: z.array(z.string()).default([])
}).passthrough();

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
}).passthrough();

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
}).passthrough();

const rolloutPhaseSchema = basePhaseSchema.extend({
  hardening: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  scale: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).default([])
}).passthrough();

const impactPhaseSchema = basePhaseSchema.extend({
  enablement: z.array(z.string()).default([]),
  governance: z.array(z.string()).default([]),
  monitoring: z.array(z.string()).default([]),
  outcome: z.string().optional(),
  quote: z.object({
    text: z.string(),
    role: z.string()
  }).optional()
}).passthrough();

const flowStripItemSchema = z.object({
  station: z.string(),
  note: z.string()
});

const stageFeatureSchema = z.object({
  title: z.string(),
  description: z.string()
});

const stage1Schema = z.object({
  tagline: z.string(),
  problem: z.string(),
  painPoints: z.array(z.string())
});

const stage2Schema = z.object({
  tagline: z.string(),
  intro: z.string(),
  points: z.array(z.string())
});

const stage3Schema = z.object({
  tagline: z.string(),
  features: z.array(stageFeatureSchema),
  builtWith: z.array(z.string()),
  screenshot: z.object({
    file: z.string(),
    alt: z.string(),
    caption: z.string()
  }),
  loop: z.object({
    name: z.string(),
    caption: z.string()
  }).optional()
});

const stage4Schema = z.object({
  tagline: z.string(),
  intro: z.string(),
  videoId: z.string().optional()
});

const stage5Schema = z.object({
  tagline: z.string(),
  makeItYours: z.string()
});

const stage6Schema = z.object({
  tagline: z.string(),
  resultsHeadline: z.string(),
  results: z.array(z.string())
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
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    oneLiner: z.string(),
    outcomeHeadline: z.string().optional(),
    problem: z.string().optional(),
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
    }).optional(),
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
    })).default([]).optional(),
    related: z.array(z.string()).default([]).optional(),
    ctaText: z.string().default("Let's talk"),

    // 6-Phase Journey & Flow Strip Fields
    status: z.enum(['Deployed', 'Accelerator']).optional(),
    client: z.string().optional(),
    timeline: z.string().optional(),
    statusTag: z.string().optional(),
    buildTag: z.string().optional(),
    stage1: stage1Schema.optional(),
    stage2: stage2Schema.optional(),
    stage3: stage3Schema.optional(),
    stage4: stage4Schema.optional(),
    stage5: stage5Schema.optional(),
    stage6: stage6Schema.optional(),
    outcomes: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).default([]),
    hero: mediaItemSchema.optional(),
    flowStrip: z.array(flowStripItemSchema).optional(),

    phases: z.object({
      problem: problemPhaseSchema.optional(),
      value: valuePhaseSchema.optional(),
      architecture: architecturePhaseSchema.optional(),
      pilot: pilotPhaseSchema.optional(),
      rollout: rolloutPhaseSchema.optional(),
      impact: impactPhaseSchema.optional()
    }).optional()
  }).passthrough()
});

export const collections = {
  products
};
