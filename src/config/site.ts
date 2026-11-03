export interface PegPillar {
  id: 'plan' | 'engineer' | 'gen-ai';
  letter: 'P' | 'E' | 'G';
  name: string;
  title?: string;
  color: string;
  tagline: string;
  description: string;
  bullets: string[];
  productSlugs?: string[]; // TO CONFIRM
  subTags?: string[];
  iconType: 'wireframe' | 'solid' | 'nodes';
}

export interface WorkStep {
  step: string;
  title: string;
  whatWeDo: string;
  deliverable: string;
  duration: string;
}

export interface FitRule {
  speed: 'weeks' | 'months';
  custom: 'standard' | 'unique';
  dataLoc: 'cloud' | 'private';
  approach: string;
  stackBadge: string;
  description: string;
  pegCombo: string;
}

export interface StoryCard {
  id: string;
  title: string;
  tag: 'Solution' | 'Approach' | 'Insight';
  href: string;
  imageKey: string;
  videoKey?: string;
  summary: string;
  focus?: string;
  alt?: string;
}

export interface BeforeAfterTab {
  id: 'clm' | 'dms' | 'whatsapp';
  label: string;
  productName: string;
  productSlug: string;
  tagline: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImageKey: string;
  stats: {
    label: string;
    before: string;
    after: string;
  }[];
}

export const siteConfig = {
  name: "RHSP",
  legalName: "Round Hole Square Peg",
  tagline: "ROUND HOLE SQUARE PEG",
  description: "Enterprise software built around how your business runs. Low-code speed on OutSystems, high-code depth in MERN, and sovereign AI.",
  url: "https://roundholesquarepeg.com",
  city: "Mumbai, India",
  copyrightYear: "2026",

  // Toggles
  showTrustBar: false, // Default: OFF until real client data exists
  showTestimonial: true,

  nav: {
    links: [
      { label: "Solutions", href: "/solutions" },
      { label: "About Us", href: "/about" },
      { label: "How We Work", href: "/about#how" },
      { label: "Contact", href: "/#contact" }
    ],
    cta: {
      label: "Let's talk",
      href: "/#contact"
    }
  },

  hero: {
    label: "ROUND HOLE SQUARE PEG",
    headline: "We engineer the bridge from challenge to solution.",
    subline: "Low-code speed on OutSystems, high-code depth in MERN, and enterprise AI that runs on your data.",
    primaryCta: {
      label: "Let's talk",
      href: "#contact"
    },
    secondaryCta: {
      label: "Explore solutions",
      href: "/solutions"
    }
  },

  // Brand Framework: The PEG Method
  pegMethod: {
    badge: "HOW WE THINK",
    headline: "Plan. Engineer. Gen-AI.",
    primaryTagline: "Three disciplines. One accountable team.",
    pillars: [
      {
        id: 'plan',
        letter: 'P',
        name: 'Plan',
        title: 'Decide right, once.',
        color: '#1E4B8F', // Navy
        tagline: 'The right decision before the first line of code.',
        description: 'Strategy, architecture, platform choice, roadmaps.',
        bullets: [
          'Clarity on what to build, and what to skip',
          'The right platform, chosen on facts, not habit',
          'A roadmap your team can actually execute'
        ],
        productSlugs: [], // TO CONFIRM: Plan is an advisory service; no discrete products
        subTags: ['Strategy', 'Architecture', 'Roadmaps'],
        iconType: 'wireframe'
      },
      {
        id: 'engineer',
        letter: 'E',
        name: 'Engineer',
        title: 'Built fast. Built to scale.',
        color: '#F7941D', // Orange
        tagline: 'Low-code speed or high-code freedom, chosen per project.',
        description: 'OutSystems or MERN, chosen per budget and requirements.',
        bullets: [
          'OutSystems: live in weeks, not quarters',
          'MERN: complete freedom, no platform ceiling',
          'We recommend what suits you, not what suits us'
        ],
        productSlugs: ['clm', 'dms', 'whatsapp-journeys'], // TO CONFIRM
        subTags: ['OutSystems Low-Code', 'High-Code MERN'],
        iconType: 'solid'
      },
      {
        id: 'gen-ai',
        letter: 'G',
        name: 'Gen-AI',
        title: 'AI you can trust with your data.',
        color: '#EE4B2B', // Red-Orange
        tagline: 'AI that works on your data, inside your walls.',
        description: 'Private by design. Powerful by default.',
        bullets: [
          'Voice agents that talk to customers 24/7',
          'Your own AI, on your own infrastructure',
          'Ask your business anything, get answers from your own data'
        ],
        productSlugs: ['voice-agents', 'sovereign-ai', 'ask-me-anything'],
        subTags: ['Voice Agents', 'Sovereign AI', 'AskMeAnything'],
        iconType: 'nodes'
      }
    ] as PegPillar[]
  },

  // Featured Story Carousel (Top carousel on homepage)
  featuredStories: [
    {
      id: "story-1",
      title: "Voice agents that pick up every call",
      tag: "Solution",
      href: "/solutions/voice-agents",
      imageKey: "feature-voice",
      focus: "center",
      alt: "Retail and showroom customer interacting with voice AI assistant on a tablet",
      summary: "Multilingual voice assistants connected to live enterprise product catalogues."
    },
    {
      id: "story-2",
      title: "Your AI, inside your walls",
      tag: "Solution",
      href: "/solutions/sovereign-ai",
      imageKey: "feature-sovereign",
      focus: "center",
      alt: "Dedicated private sovereign AI server cluster and protected data environment",
      summary: "AI that works on your data, inside your walls."
    },
    {
      id: "story-3",
      title: "From paper to platform",
      tag: "Approach",
      href: "/#shift",
      imageKey: "feature-paper-to-platform",
      focus: "center",
      alt: "Architectural transformation from manual paper ledgers to a modern web application",
      summary: "Replacing scattered physical approvals and spreadsheets with structured digital workflows."
    },
    {
      id: "story-4",
      title: "OutSystems or MERN? We choose per project",
      tag: "Insight",
      href: "/#stack",
      imageKey: "feature-build-stack",
      focus: "center",
      alt: "Balanced engineering blueprint comparing OutSystems low-code with high-code MERN architecture",
      summary: "Choosing stacks based on timeline, compliance, and budget rather than platform dogma."
    },
    {
      id: "story-5",
      title: "Plan, Engineer, Gen-AI",
      tag: "Approach",
      href: "/about#peg",
      imageKey: "feature-peg",
      focus: "center",
      alt: "The Plan, Engineer, and Gen-AI method building adapters around enterprise reality",
      summary: "How Plan, Engineer, and Gen-AI unite to adapt technology around the business."
    }
  ] as StoryCard[],

  // Solutions Section on Homepage
  solutionsSection: {
    eyebrow: "SOLUTIONS",
    headline: "Built around how your business runs.",
    subline: "Enterprise platforms built around your existing workflows, not someone else's templates."
  },

  // Before / After Centrepiece Interaction
  beforeAfter: {
    eyebrow: "THE SHIFT",
    headline: "From paperwork to platform.",
    subline: "See what changes when manual steps become a purpose-built platform.",
    disclaimer: "Representative interface - styled in RHSP design tokens.",
    tabs: [
      {
        id: "clm",
        label: "Contracts (CLM)",
        productName: "Contract Lifecycle Management",
        productSlug: "clm",
        tagline: "From lost drafts in email threads to audit-trailed digital sign-offs.",
        beforeLabel: "Today",
        afterLabel: "With RHSP",
        beforeImageKey: "before-clm",
        stats: [
          { label: "Draft to Approval Cycle", before: "[PLACEHOLDER] 14 Days", after: "[PLACEHOLDER] 2 Days" },
          { label: "Milestone Tracking Visibility", before: "[PLACEHOLDER] Spreadsheet", after: "[PLACEHOLDER] Automated" },
          { label: "Compliance Risk Incidents", before: "[PLACEHOLDER] High", after: "[PLACEHOLDER] Audited" }
        ]
      },
      {
        id: "dms",
        label: "Documents (DMS)",
        productName: "Document Management System",
        productSlug: "dms",
        tagline: "From scattered local drives and lost scans to indexed, role-governed custody.",
        beforeLabel: "Today",
        afterLabel: "With RHSP",
        beforeImageKey: "before-dms",
        stats: [
          { label: "Document Retrieval Time", before: "[PLACEHOLDER] Hours", after: "[PLACEHOLDER] Seconds" },
          { label: "Version Control Conflicts", before: "[PLACEHOLDER] Frequent", after: "[PLACEHOLDER] Zero" },
          { label: "Access Governance Audit", before: "[PLACEHOLDER] Manual", after: "[PLACEHOLDER] Automated" }
        ]
      },
      {
        id: "whatsapp",
        label: "Customer journeys (WhatsApp)",
        productName: "WhatsApp Journeys",
        productSlug: "whatsapp-journeys",
        tagline: "From unanswered emails and app download barriers to instant conversational self-service.",
        beforeLabel: "Today",
        afterLabel: "With RHSP",
        beforeImageKey: "before-whatsapp",
        stats: [
          { label: "Notification Open Rate", before: "[PLACEHOLDER] ~15%", after: "[PLACEHOLDER] ~90%" },
          { label: "Self-Service Resolution", before: "[PLACEHOLDER] Low", after: "[PLACEHOLDER] High" },
          { label: "App Download Friction", before: "[PLACEHOLDER] Barrier", after: "[PLACEHOLDER] Zero Install" }
        ]
      }
    ] as BeforeAfterTab[]
  },

  // Build Your Way (OutSystems vs MERN interactive band)
  buildYourWay: {
    headline: "One challenge. The stack it deserves.",
    subline: "We choose per project - budget, timeline and complexity decide, not habit.",
    options: {
      outsystems: {
        title: "OutSystems (Low-Code)",
        badge: "Visual Speed & Governance",
        description: "Enterprise visual development, rapid sprint delivery, governance, and cloud or on-premise execution.",
        chips: ["Visual Logic", "Role Governance", "Rapid Sprints", "Enterprise Security"]
      },
      mern: {
        title: "MERN (High-Code)",
        badge: "Full Custom Freedom",
        description: "Full-stack engineering utilizing MongoDB, Express, React, and Node.js for specialized application architectures.",
        chips: ["MongoDB", "Express", "React", "Node.js"]
      }
    }
  },

  // Statement Band
  statementBand: {
    headline: "Got a square peg?",
    subline: "Tell us about your operational workflows. We will engineer the adapter.",
    cta: {
      label: "Let's talk",
      href: "#contact"
    }
  },

  // How We Work (Methodology track for /about page)
  howWeWork: {
    badge: "METHODOLOGY",
    headline: "From first conversation to live system.",
    subline: "A disciplined, four-phase delivery cycle that ensures the technology adapts to your organization.",
    steps: [
      {
        step: "01",
        title: "Discover",
        whatWeDo: "Map existing workflows, operational bottlenecks, data boundaries, and user friction points.",
        deliverable: "Architecture & Requirement Alignment Brief",
        duration: "[PLACEHOLDER] 1–2 Weeks"
      },
      {
        step: "02",
        title: "Design",
        whatWeDo: "Determine the technical architecture: OutSystems low-code, bespoke MERN high-code, or private AI integration.",
        deliverable: "Technical Blueprint & Interactive Wireframes",
        duration: "[PLACEHOLDER] 2–3 Weeks"
      },
      {
        step: "03",
        title: "Build",
        whatWeDo: "Agile delivery sprints with weekly progress reviews, rigorous security reviews, and continuous client testing.",
        deliverable: "Production-Ready Application & Full Test Coverage",
        duration: "[PLACEHOLDER] 6–10 Weeks"
      },
      {
        step: "04",
        title: "Run",
        whatWeDo: "Sovereign deployment, team enablement, handover documentation, and proactive SLA monitoring.",
        deliverable: "Operational Handover & SLA Support Plan",
        duration: "[PLACEHOLDER] Ongoing"
      }
    ] as WorkStep[],

    findYourFit: {
      headline: "Find your approach in 30 seconds",
      subline: "Select your project parameters to see our recommended PEG approach.",
      disclaimer: "A starting point. We finalize the approach together.",
      questions: [
        {
          id: "speed",
          label: "How fast do you need it?",
          options: [
            { id: "weeks", label: "Weeks" },
            { id: "months", label: "Months" }
          ]
        },
        {
          id: "custom",
          label: "How custom is your process?",
          options: [
            { id: "standard", label: "Standard-ish" },
            { id: "unique", label: "Very unique" }
          ]
        },
        {
          id: "dataLoc",
          label: "Where must your data live?",
          options: [
            { id: "cloud", label: "Cloud is fine" },
            { id: "private", label: "Inside our walls" }
          ]
        }
      ],
      rules: [
        {
          speed: "weeks",
          custom: "standard",
          dataLoc: "cloud",
          approach: "OutSystems Rapid Build",
          stackBadge: "Low-Code",
          pegCombo: "Engineer (OutSystems)",
          description: "Accelerated visual delivery on OutSystems for fast time-to-value with enterprise compliance and cloud hosting."
        },
        {
          speed: "weeks",
          custom: "standard",
          dataLoc: "private",
          approach: "OutSystems On-Premises Build",
          stackBadge: "Low-Code + Private",
          pegCombo: "Plan + Engineer (OutSystems)",
          description: "Rapid low-code application development configured for private virtual cloud (VPC) or local server isolation."
        },
        {
          speed: "weeks",
          custom: "unique",
          dataLoc: "cloud",
          approach: "Hybrid OutSystems & MERN Microservices",
          stackBadge: "Hybrid",
          pegCombo: "Engineer (Hybrid)",
          description: "OutSystems portal for fast workflow control, augmented by targeted custom microservices for unique business rules."
        },
        {
          speed: "weeks",
          custom: "unique",
          dataLoc: "private",
          approach: "Hybrid Build + Sovereign AI",
          stackBadge: "Hybrid + Sovereign",
          pegCombo: "Engineer + Gen-AI",
          description: "Private on-prem deployment combining rapid application logic with localized AI processing within your perimeter."
        },
        {
          speed: "months",
          custom: "standard",
          dataLoc: "cloud",
          approach: "OutSystems Core Transformation",
          stackBadge: "Enterprise Low-Code",
          pegCombo: "Plan + Engineer (OutSystems)",
          description: "Structured phased modernization of multi-department workflows with centralized governance and automated deployments."
        },
        {
          speed: "months",
          custom: "standard",
          dataLoc: "private",
          approach: "Private Enterprise Platform Build",
          stackBadge: "Private Cloud / On-Prem",
          pegCombo: "Plan + Engineer",
          description: "Complete operational tooling isolated from public networks, ensuring full regulatory compliance."
        },
        {
          speed: "months",
          custom: "unique",
          dataLoc: "cloud",
          approach: "High-Code MERN Engineering",
          stackBadge: "High-Code (MERN)",
          pegCombo: "Engineer (MERN)",
          description: "Bespoke full-stack engineering utilizing MongoDB, Express, React, and Node.js for specialized performance and unique logic."
        },
        {
          speed: "months",
          custom: "unique",
          dataLoc: "private",
          approach: "Bespoke High-Code & Sovereign AI Stack",
          stackBadge: "Full High-Code + Sovereign",
          pegCombo: "Plan + Engineer (MERN) + Gen-AI",
          description: "Full architectural customization built from first principles with zero vendor lock-in and 100% on-premises data custody."
        }
      ] as FitRule[]
    }
  },

  // Origin Story & Why RHSP (for /about)
  about: {
    hero: {
      headline: "Tech that adapts to business.",
      subline: "Every challenge gets its own adapter.",
      imageKey: "about-hero",
      focus: "center 70%"
    },
    mandate: {
      badge: "OUR MANDATE",
      headline: "Built on lasting enterprise value.",
      subline: "Three foundational principles guiding every architecture decision.",
      cards: [
        {
          num: "01",
          label: "01 MISSION",
          title: "Mission",
          text: "We deploy technology that adapts to your unique business process, unlocking latent revenue.",
          imageKey: "about-mission-icon"
        },
        {
          num: "02",
          label: "02 PURPOSE",
          title: "Purpose",
          text: "To empower clients through intelligent automation that simplifies operations, reduces manual effort, and delivers clear, measurable business value.",
          imageKey: "about-purpose-icon"
        },
        {
          num: "03",
          label: "03 VISION",
          title: "Vision",
          // TO CONFIRM
          text: "To be the trusted technology partner for Indian enterprises, delivering practical, intelligent automation that cuts costs, drives sustainable growth and makes advanced AI accessible and impactful.",
          imageKey: "about-vision-icon"
        }
      ]
    },
    story: {
      badge: "OUR ORIGIN",
      headline: "The Apollo 13 imperative.",
      originLines: [
        "In April 1970, Apollo 13 suffered an explosion 200,000 miles from Earth.",
        "NASA engineers had to connect square lithium hydroxide canisters to round sockets using only what was on board.",
        "They engineered the adapter using only what was on board."
      ],
      conclusion: "Round Hole Square Peg is built on the same principle: understand the challenge, then engineer the bridge to the solution."
    },
    whyRhsp: {
      badge: "WHY RHSP",
      headline: "Enterprise engineering, chosen on merit.",
      differentiators: [
        {
          title: "Low-code speed, high-code freedom.",
          description: "[PLACEHOLDER] Rapid time-to-market using OutSystems paired with bespoke MERN software engineering when unique constraints require custom code."
        },
        {
          title: "OT + IT experience - from factory floors to banking systems.",
          description: "[PLACEHOLDER] Leadership experience spanning industrial operational hardware to mission-critical financial transaction platforms."
        },
        {
          title: "Your data stays yours.",
          description: "[PLACEHOLDER] Private cloud and on-premise deployment patterns with complete client data retention and zero vendor lock-in."
        },
        {
          title: "Founder-led delivery.",
          description: "[PLACEHOLDER] Direct technical oversight and strategic involvement from founders on every enterprise engagement."
        }
      ]
    }
  },

  // Trust Bar config (for /about, default off)
  trustBar: {
    heading: "Trusted by forward-thinking teams across sectors",
    industries: [
      { name: "BFSI & Fintech", glyph: "BANK" },
      { name: "Manufacturing & OT", glyph: "IND" },
      { name: "Energy & Infrastructure", glyph: "GRID" },
      { name: "Supply Chain & Logistics", glyph: "CARGO" },
      { name: "Healthcare & Life Sciences", glyph: "HEALTH" }
    ],
    stats: [
      { value: "[PLACEHOLDER]", label: "Projects Delivered", detail: "Across enterprise domains" },
      { value: "[PLACEHOLDER]", label: "Average Sprint Velocity", detail: "Concept to functional MVP" },
      { value: "[PLACEHOLDER]", label: "Data Retention Guarantee", detail: "Private infrastructure" }
    ]
  },

  team: {
    label: "LEADERSHIP",
    headline: "Engineers and enterprise operators.",
    members: [
      {
        name: "Subramaniam (Subu) Iyer",
        role: "Founder",
        bio: "18+ years bringing together operational technology and IT, from robotics and ASRS in steel, tyre and semiconductor industries to paperless loan origination systems in BFSI; specialises in OutSystems and Enterprise AI.",
        linkedin: "https://linkedin.com/in/thesubuiyer",
        initials: "SI",
        imageKey: "founder-subu"
      },
      {
        name: "Abhishek Bagwe",
        role: "Co-founder",
        bio: "An 18-year corporate career leading strategic initiatives at Tata Power and Tata Motors; drives RHSP's growth, scalability and client acquisition.",
        linkedin: "https://linkedin.com/in/abhishek-bagwe-90ba8710",
        initials: "AB",
        imageKey: "founder-abhishek"
      }
    ]
  },

  contact: {
    label: "CONNECT",
    headline: "Every problem has an angle. Let's find yours.",
    subline: "Low-code, high-code or sovereign AI: our engineers are ready to build it with you.",
    email: "letstalk@rhsp.solutions",
    address: "ThePlayce, 17th Floor, Marathon Millennium, Lal Bahadur Shastri Marg, beside Nirmal Lifestyle Road, Moti Nagar, Mulund Colony, Mulund West, Mumbai, Maharashtra 400080",
    mapUrl: "https://maps.app.goo.gl/CZZiZs7fzmFmLVCf6"
  },

  socials: {
    linkedin: "https://linkedin.com/company/roundholesquarepeg",
    twitter: "https://x.com/RoundHoleSqrPeg",
    youtube: "https://youtube.com/@roundholesquarepeg"
  },

  // TODO og-default: replace with 1200x630 asset when delivered
  ogDefault: "/media/raw/social/og-default.png"
};
