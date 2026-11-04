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
  tagline: "Tech that adapts to business.",
  description: "RHSP is a technology partner for enterprises: consulting, implementation services and digital transformation, accelerators, and custom development.",
  url: "https://roundholesquarepeg.com",
  city: "Mumbai, India",
  copyrightYear: "2026",

  // Toggles
  showTrustBar: false, // Default: OFF until real client data exists
  showTestimonial: true,

  nav: {
    links: [
      { label: "About Us", href: "/about" },
      { label: "PEG Board", href: "#", comingSoon: true },
      { label: "Contact", href: "/#contact" }
    ],
    cta: {
      label: "Let's talk",
      href: "/#contact"
    }
  },

  hero: {
    label: "ROUND HOLE SQUARE PEG",
    headline: "Tech that adapts to business.",
    subline: "RHSP is a technology partner for enterprises: consulting, implementation services and digital transformation, accelerators, and custom development.",
    primaryCta: {
      label: "Let's talk",
      href: "#contact"
    },
    secondaryCta: {
      label: "Explore solutions",
      href: "#solutions"
    }
  },

  // Brand Framework: The PEG Method
  pegMethod: {
    badge: "HOW WE THINK",
    headline: "Plan with foresight. Engineer with precision. Gen-AI the leap.",
    primaryTagline: "Three disciplines. One accountable team.",
    pillars: [
      {
        id: 'plan',
        letter: 'P',
        name: 'Plan',
        title: 'Plan with foresight.',
        color: '#1E4B8F', // Navy
        tagline: 'Plan with foresight.',
        description: 'Objective platform selection, architecture blueprints, and founder-led advisory.',
        bullets: [
          'Platform selection: low-code OutSystems vs high-code MERN vs hybrid',
          'Architecture blueprints and execution roadmaps',
          'Founder-led advisory for high-stakes enterprise decisions'
        ],
        productSlugs: [], // Plan is an advisory service; no discrete products
        subTags: ['Platform Selection', 'Architecture Blueprints', 'Advisory'],
        iconType: 'wireframe'
      },
      {
        id: 'engineer',
        letter: 'E',
        name: 'Engineer',
        title: 'Engineer with precision.',
        color: '#F7941D', // Orange
        tagline: 'Engineer with precision.',
        description: 'OutSystems implementation and custom MERN development, built around enterprise workflows.',
        bullets: [
          'Implementation & digital transformation on OutSystems',
          'Custom development in MERN with full architectural control',
          'Accelerators: CLM, Vernacular Documents, DMS, and WhatsApp Journeys'
        ],
        productSlugs: ['clm', 'vernacular-documents', 'dms', 'whatsapp-journeys'],
        subTags: ['OutSystems Low-Code', 'High-Code MERN', 'Accelerators'],
        iconType: 'solid'
      },
      {
        id: 'gen-ai',
        letter: 'G',
        name: 'Gen-AI',
        title: 'Gen-AI the leap.',
        color: '#EE4B2B', // Red-Orange
        tagline: 'Gen-AI the leap.',
        description: 'Private, catalogue-grounded, production-ready AI operating inside your walls.',
        bullets: [
          'Sonakshi: AI voice agent in MERN, deployed for a retail store',
          'Sovereign AI: Private enterprise LLM deployments on your infrastructure',
          'AskMeAnything: Enterprise search across documents and data'
        ],
        productSlugs: ['sonakshi', 'sovereign-ai', 'ask-me-anything'],
        subTags: ['Sonakshi', 'Sovereign AI', 'AskMeAnything'],
        iconType: 'nodes'
      }
    ] as PegPillar[]
  },

  // Our Approach: Six Stages Journey
  approach: {
    badge: "OUR APPROACH",
    headline: "A journey we take with you.",
    subline: "Six stages from first conversation to a system your team relies on.",
    closingCta: {
      label: "See how we can start",
      href: "#contact"
    },
    steps: [
      {
        number: 1,
        title: "Understand the business",
        description: "We study your processes, goals and challenges before proposing anything.",
        detail: "OT and IT experience lets us read both the floor-level process and the system of record.",
        icon: "compass" as const,
        color: "#1E4B8F"
      },
      {
        number: 2,
        title: "Identify latent revenue",
        description: "We find the untapped value hiding in your workflows, data and customer journeys.",
        detail: "Enterprise strategy experience helps us size the value in cost, cycle time and revenue before we build.",
        icon: "dollar" as const,
        color: "#27599D"
      },
      {
        number: 3,
        title: "Design adaptive systems",
        description: "We architect intelligent systems that adapt to how your business runs and unlock that value.",
        detail: "Low-code or high-code is chosen on merit: OutSystems for speed, MERN for depth, AI where the data calls for it.",
        icon: "sliders" as const,
        color: "#C28026"
      },
      {
        number: 4,
        title: "Pilot with on-ground teams",
        description: "We test the solution with the people who will use it, on real workflows.",
        detail: "Pilots run with the operators who use the system daily, as in our robotics and warehouse automation work.",
        icon: "users" as const,
        color: "#F7941D"
      },
      {
        number: 5,
        title: "Refine and deploy",
        description: "We improve from pilot feedback and launch with confidence.",
        detail: "Paperless, audit-ready releases informed by regulated financial-services delivery.",
        icon: "code" as const,
        color: "#F16524"
      },
      {
        number: 6,
        title: "Enable and monitor",
        description: "We train your teams and keep watching the system so the value keeps growing.",
        detail: "Training, SLAs and monitoring keep adoption high and the value growing at scale.",
        icon: "shield" as const,
        color: "#EE4B2B"
      }
    ]
  },

  // Featured Story Carousel (Top carousel on homepage)
  featuredStories: [
    {
      id: "story-1",
      title: "Sonakshi – voice agents that pick up every call",
      tag: "Solution",
      href: "/solutions/sonakshi",
      imageKey: "feature-voice",
      focus: "center",
      alt: "Retail and showroom customer interacting with voice AI assistant on a tablet",
      summary: "Voice assistant that answers shoppers' product questions in their own language."
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
      href: "/solutions/clm",
      imageKey: "feature-paper-to-platform",
      focus: "center",
      alt: "Architectural transformation from manual paper ledgers to a modern web application",
      summary: "Contract workflow from request to signature, for business, risk, legal and vendor teams."
    },
    {
      id: "story-4",
      title: "OutSystems or MERN? We choose per project",
      tag: "Insight",
      href: "/#solutions",
      imageKey: "feature-build-stack",
      focus: "center",
      alt: "Balanced engineering blueprint comparing OutSystems low-code with high-code MERN architecture",
      summary: "Choosing stacks based on timeline, compliance, and budget rather than platform dogma."
    },
    {
      id: "story-5",
      title: "Plan, Engineer, Gen-AI",
      tag: "Approach",
      href: "/#solutions",
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
          text: "We deploy technology that adapts to your unique business processes, unlocking latent revenue.",
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
      conclusion: "Round Hole Square Peg is built on the same principle: understand the challenge, then engineer the adapter to the solution."
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
        bio: `Subu Iyer transforms operational friction into scalable technology. His expertise is defined by a rare convergence of Operational Technology (OT) and Information Technology (IT), bringing industrial rigor to digital transformation.\n\nWith 18+ years of experience, Subu has navigated from high-precision Robotics and ASRS in industries like Steel, Tire, and Semiconductors to architecting paperless Loan Origination Systems in BFSI.\n\nSpecializing in OutSystems and Enterprise AI, Subu helps C-suite leaders solve unique "square peg" challenges, ensuring that businesses can innovate rapidly without sacrificing data sovereignty or architectural integrity.`,
        linkedin: "https://linkedin.com/in/thesubuiyer",
        initials: "SI",
        imageKey: "founder-subu"
      },
      {
        name: "Abhishek Bagwe",
        role: "Co-founder",
        bio: `As Co-Founder, Abhishek brings the executive weight of an 18-year corporate career to our startup’s foundation. Having led strategic initiatives for Tata Power and Tata Motors, and currently steering global expansion for FIRETECH, he is responsible for engineering our company’s growth engine.\n\nAbhishek moves beyond the typical startup mindset; he applies proven management frameworks to our AI consulting operations, focusing on rapid scalability, operational efficiency, and high-value client acquisition. He ensures our delivery models are robust enough to serve the very global conglomerates he used to manage.`,
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
