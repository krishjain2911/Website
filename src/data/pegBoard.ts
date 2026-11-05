// Draft copy: founders to review before launch

export const FEATURES = {
  arrival: true,
  tilt: true,
  finder: true,
  search: true,
  quickTake: true,
  emptySlots: true,
  adapterMoment: true
};

export const ZONE_ORDER = ['solutions', 'case-studies', 'resources', 'playground'] as const;
export type ZoneId = (typeof ZONE_ORDER)[number];

export interface BoardZone {
  id: ZoneId;
  label: string;
  accentColor: string; // e.g. '#EE4B2B' | '#F7941D' | '#1E4B8F'
  accentClass: string;
}

export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'x'
  | 'menu'
  | 'play'
  | 'pause'
  | 'rotate-ccw'
  | 'copy'
  | 'check'
  | 'phone'
  | 'mail'
  | 'external-link'
  | 'code'
  | 'layers'
  | 'cpu'
  | 'eye'
  | 'file-text'
  | 'database'
  | 'message-square'
  | 'sliders'
  | 'zap'
  | 'sparkles'
  | 'compass'
  | 'shield'
  | 'users'
  | 'key'
  | 'sun'
  | 'moon'
  | 'search'
  | 'map-pin'
  | 'dollar'
  | 'currency-dollar'
  | 'bookmark'
  | 'folder-git-2'
  | 'cloud'
  | 'server';

export interface BoardTileItem {
  slug: string;
  zoneId: ZoneId;
  title: string;
  description: string;
  quickTake?: string;
  tag: string; // "Coming soon" | "Solution" | "Guide" | "Interactive" | "Tool" | "Comparison"
  href: string;
  action?: 'open-adapter' | 'open-finder';
  iconName: IconName;
  pegColor: string;
}

export interface ComparisonRow {
  topic: string;
  columns: string[];
}

export interface PickerChip {
  id: string;
  label: string;
  weights: Record<string, number>; // optionId -> weight
}

export interface PickerData {
  options: {
    id: string;
    label: string;
    reason: string;
  }[];
  blendLabel: string;
  blendReason: string;
  chips: PickerChip[];
}

export interface ResourceGuide {
  slug: string;
  tileTitle: string;
  tileDescription: string;
  quickTake: string;
  h1: string;
  summary: string;
  intro: string;
  tableHeaders: string[]; // [Topic, Option1, Option2, (Option3)]
  tableRows: ComparisonRow[];
  tableNote?: string;
  chooseWhen: {
    title: string;
    points: string[];
  }[];
  howWeDecide: string;
  picker: PickerData;
  seoDescription: string;
  // Founder review note (code comment only): confirm the hosting and architecture statements against current OutSystems documentation before launch.
}

export interface FinderQuestion {
  id: 'speed' | 'custom' | 'data' | 'estate';
  legend: string;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
}

export interface EmptySlot {
  id: string;
  title?: string;
  hasSway: boolean;
  pegColor: string;
}

export const emptySlots: EmptySlot[] = [];

export const finderQuestions: FinderQuestion[] = [
  {
    id: 'speed',
    legend: 'Timeline',
    options: [
      { id: 'speed-weeks', label: 'Weeks', value: 'weeks' },
      { id: 'speed-months', label: 'Months', value: 'months' }
    ]
  },
  {
    id: 'custom',
    legend: 'Experience & process',
    options: [
      { id: 'custom-standard', label: 'Standard-ish', value: 'standard-ish' },
      { id: 'custom-unique', label: 'Very unique', value: 'very unique' }
    ]
  },
  {
    id: 'data',
    legend: 'Data location',
    options: [
      { id: 'data-cloud', label: 'Cloud is fine', value: 'cloud is fine' },
      { id: 'data-walls', label: 'Inside our walls', value: 'inside our walls' }
    ]
  },
  {
    id: 'estate',
    legend: 'Existing stack',
    options: [
      { id: 'estate-o11', label: 'We already run OutSystems 11', value: 'o11' }
    ]
  }
];

export const zones: BoardZone[] = [
  {
    id: 'solutions',
    label: 'Solutions',
    accentColor: '#F7941D', // orange
    accentClass: 'zone-orange'
  },
  {
    id: 'case-studies',
    label: 'Case studies',
    accentColor: '#1E4B8F', // blue (lightened to #5B8FE0 in dark mode)
    accentClass: 'zone-blue'
  },
  {
    id: 'resources',
    label: 'Resources',
    accentColor: '#F7941D', // orange
    accentClass: 'zone-orange'
  },
  {
    id: 'playground',
    label: 'Playground',
    accentColor: '#1E4B8F', // blue (lightened to #5B8FE0 in dark mode)
    accentClass: 'zone-blue'
  }
];

export const tiles: BoardTileItem[] = [
  // Zone 1: Solutions (7 individual solutions from products)
  {
    slug: 'clm',
    zoneId: 'solutions',
    title: 'CLM',
    description: 'Contract workflow from request to signature, for business, risk, legal and vendor teams.',
    tag: 'Solution',
    href: '/solutions/clm',
    iconName: 'file-text',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'vernacular-documents',
    zoneId: 'solutions',
    title: 'Vernacular Documents',
    description: 'Template-driven documents in your languages, generated on demand for business systems.',
    tag: 'Solution',
    href: '/solutions/vernacular-documents',
    iconName: 'file-text',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'sonakshi',
    zoneId: 'solutions',
    title: 'Sonakshi',
    description: "Voice assistant that answers shoppers' product questions in their own language.",
    tag: 'Solution',
    href: '/solutions/sonakshi',
    iconName: 'phone',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'ask-me-anything',
    zoneId: 'solutions',
    title: 'AskMeAnything',
    description: 'Grounded enterprise search answering operational questions across internal documents.',
    tag: 'Solution',
    href: '/solutions/ask-me-anything',
    iconName: 'message-square',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'dms',
    zoneId: 'solutions',
    title: 'DMS',
    description: 'Enterprise document archival, metadata classification, and compliance retention.',
    tag: 'Solution',
    href: '/solutions/dms',
    iconName: 'database',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'sovereign-ai',
    zoneId: 'solutions',
    title: 'Sovereign AI',
    description: 'Private enterprise AI that keeps sensitive organization data strictly within your walls.',
    tag: 'Solution',
    href: '/solutions/sovereign-ai',
    iconName: 'shield',
    pegColor: '#EE4B2B'
  },
  {
    slug: 'whatsapp-journeys',
    zoneId: 'solutions',
    title: 'WhatsApp Journeys',
    description: 'Customer service workflows, automated updates, and self-service on WhatsApp.',
    tag: 'Solution',
    href: '/solutions/whatsapp-journeys',
    iconName: 'message-square',
    pegColor: '#EE4B2B'
  },

  // Zone 2: Case studies (1 tile)
  {
    slug: 'case-studies',
    zoneId: 'case-studies',
    title: 'Case studies',
    description: 'Real client journeys and production results.',
    tag: 'Coming soon',
    href: '/peg-board/case-studies',
    iconName: 'folder-git-2',
    pegColor: '#F7941D'
  },

  // Zone 3: Resources (4 guides with quickTake)
  {
    slug: 'outsystems-vs-mern',
    zoneId: 'resources',
    title: 'OutSystems vs MERN',
    description: 'Two stacks, chosen per project.',
    quickTake: 'Do you need a launch in weeks, or full control of the code?',
    tag: 'Guide',
    href: '/peg-board/outsystems-vs-mern',
    iconName: 'layers',
    pegColor: '#1E4B8F'
  },
  {
    slug: 'o11-vs-odc',
    zoneId: 'resources',
    title: 'O11 vs ODC',
    description: 'OutSystems 11 and OutSystems Developer Cloud.',
    quickTake: 'Is this a new build, or an existing OutSystems estate?',
    tag: 'Guide',
    href: '/peg-board/o11-vs-odc',
    iconName: 'cloud',
    pegColor: '#1E4B8F'
  },
  {
    slug: 'cloud-vs-on-premises',
    zoneId: 'resources',
    title: 'Cloud vs on-premises',
    description: 'Where your data and applications live.',
    quickTake: 'Does your data need to stay inside your walls?',
    tag: 'Guide',
    href: '/peg-board/cloud-vs-on-premises',
    iconName: 'server',
    pegColor: '#1E4B8F'
  },
  {
    slug: 'low-code-vs-high-code',
    zoneId: 'resources',
    title: 'Low-code vs high-code vs hybrid',
    description: 'Three ways to build, one way to decide.',
    quickTake: 'Is your process mostly standard, or mostly unique?',
    tag: 'Guide',
    href: '/peg-board/low-code-vs-high-code',
    iconName: 'code',
    pegColor: '#1E4B8F'
  },

  // Zone 4: Playground (interactive tools and comparisons)
  {
    slug: 'adapter-widget',
    zoneId: 'playground',
    title: 'Try the adapter',
    description: 'Slide the square peg into the round hole.',
    tag: 'Interactive',
    href: '#adapter-modal',
    action: 'open-adapter',
    iconName: 'sliders',
    pegColor: '#F7941D'
  },
  {
    slug: 'peg-finder',
    zoneId: 'playground',
    title: 'Peg Finder',
    description: 'Answer three quick questions to highlight your starting point.',
    tag: 'Interactive',
    href: '#finder-modal',
    action: 'open-finder',
    iconName: 'compass',
    pegColor: '#F7941D'
  },
  {
    slug: 'priority-picker',
    zoneId: 'playground',
    title: 'Priority picker',
    description: 'Toggle decision criteria to weigh architectural options.',
    tag: 'Tool',
    href: '/peg-board/outsystems-vs-mern#picker-section',
    iconName: 'sliders',
    pegColor: '#F7941D'
  },
  {
    slug: 'calc-outsystems-vs-mern',
    zoneId: 'playground',
    title: 'OutSystems vs MERN',
    description: 'Side-by-side comparison across speed, governance and control.',
    tag: 'Comparison',
    href: '/peg-board/outsystems-vs-mern#comparison-table',
    iconName: 'layers',
    pegColor: '#F7941D'
  },
  {
    slug: 'calc-o11-vs-odc',
    zoneId: 'playground',
    title: 'O11 vs ODC',
    description: 'Compare containerized cloud deployment and traditional architectures.',
    tag: 'Comparison',
    href: '/peg-board/o11-vs-odc#comparison-table',
    iconName: 'cloud',
    pegColor: '#F7941D'
  },
  {
    slug: 'calc-cloud-vs-on-premises',
    zoneId: 'playground',
    title: 'Cloud vs on-premises',
    description: 'Compare isolation, residency boundaries and operational overhead.',
    tag: 'Comparison',
    href: '/peg-board/cloud-vs-on-premises#comparison-table',
    iconName: 'server',
    pegColor: '#F7941D'
  }
];

export const guides: Record<string, ResourceGuide> = {
  'outsystems-vs-mern': {
    slug: 'outsystems-vs-mern',
    tileTitle: 'OutSystems vs MERN',
    tileDescription: 'Two stacks, chosen per project.',
    quickTake: 'Do you need a launch in weeks, or full control of the code?',
    h1: 'OutSystems or MERN: choosing the stack',
    summary: 'We build on both. This is how we think about the choice.',
    intro: 'OutSystems is a low-code platform. MERN (MongoDB, Express, React, Node.js) is a high-code stack. Each is strong in different conditions, so we choose per project.',
    tableHeaders: ['Topic', 'OutSystems', 'MERN'],
    tableRows: [
      {
        topic: 'Time to a working app',
        columns: [
          'Visual development with built-in components and deployment tooling gives a short path to a first release.',
          'More set-up at the start, since the team assembles the architecture, access control and pipelines.'
        ]
      },
      {
        topic: 'Customisation',
        columns: [
          'Broad, and extensible with custom code and integrations inside the platform\'s model.',
          'Full control of every layer of the application.'
        ]
      },
      {
        topic: 'Governance and security tooling',
        columns: [
          'Environments, access control and deployment management come with the platform.',
          'Built and maintained by the project team.'
        ]
      },
      {
        topic: 'Ownership',
        columns: [
          'Runs on the OutSystems platform under its licence.',
          'Open-source stack; code and hosting are entirely yours.'
        ]
      },
      {
        topic: 'Team skills',
        columns: [
          'OutSystems specialists, with a faster ramp-up for visual developers.',
          'Widely available JavaScript engineering skills.'
        ]
      },
      {
        topic: 'Typical use',
        columns: [
          'Workflow-heavy enterprise applications, portals and internal tools.',
          'Products with a distinctive experience, real-time features or heavy AI components. Our Sonakshi voice agent is built on MERN.'
        ]
      }
    ],
    chooseWhen: [
      {
        title: 'Choose OutSystems when',
        points: [
          'You need a working application quickly.',
          'Your process is workflow-heavy and needs strong governance.',
          'Your team wants to maintain the application visually.'
        ]
      },
      {
        title: 'Choose MERN when',
        points: [
          'The experience or logic is highly distinctive.',
          'You want full ownership of the code and hosting.',
          'The product leans on real-time or custom AI components.'
        ]
      }
    ],
    howWeDecide: 'Many projects use both: OutSystems for the workflow core and MERN microservices for the parts that need to be unusual. We recommend the combination that keeps your timeline and your long-term ownership goals in view.',
    picker: {
      options: [
        {
          id: 'outsystems',
          label: 'OutSystems',
          reason: 'Your priorities point to OutSystems: a short path to launch with governance built in.'
        },
        {
          id: 'mern',
          label: 'MERN',
          reason: 'Your priorities point to MERN: full control of the code and the experience.'
        }
      ],
      blendLabel: 'A blend: OutSystems for workflows, MERN for the distinctive parts',
      blendReason: 'A balanced approach lets you leverage OutSystems for rapid, governed core workflows while using MERN for custom or real-time components.',
      chips: [
        { id: 'speed', label: 'Speed to launch', weights: { outsystems: 2 } },
        { id: 'governance', label: 'Built-in governance', weights: { outsystems: 2 } },
        { id: 'visual-maint', label: 'Maintained visually by our team', weights: { outsystems: 1 } },
        { id: 'deep-custom', label: 'Deep customisation', weights: { mern: 2 } },
        { id: 'full-ownership', label: 'Full code ownership', weights: { mern: 2 } },
        { id: 'realtime-ai', label: 'Real-time or AI-heavy experience', weights: { mern: 1 } }
      ]
    },
    seoDescription: 'We build on both. This is how we think about the choice. Part of the RHSP PEG Board.'
  },

  'o11-vs-odc': {
    slug: 'o11-vs-odc',
    tileTitle: 'O11 vs ODC',
    tileDescription: 'OutSystems 11 and OutSystems Developer Cloud.',
    quickTake: 'Is this a new build, or an existing OutSystems estate?',
    h1: 'O11 or ODC: which OutSystems platform',
    summary: 'OutSystems 11 and OutSystems Developer Cloud serve different situations.',
    intro: 'OutSystems 11 (O11) is the long-established platform. OutSystems Developer Cloud (ODC) is the newer, cloud-native generation delivered as a managed service.',
    tableHeaders: ['Topic', 'O11', 'ODC'],
    tableRows: [
      {
        topic: 'Maturity',
        columns: [
          'Long-established, with many production estates.',
          'Newer generation, built for cloud-native delivery.'
        ]
      },
      {
        topic: 'Hosting',
        columns: [
          'Can be hosted in the cloud or on infrastructure you manage.',
          'Delivered as a managed cloud service.'
        ]
      },
      {
        topic: 'Architecture',
        columns: [
          'Applications are organised in modules within environments.',
          'Container-based, with applications and libraries deployed independently.'
        ]
      },
      {
        topic: 'Existing estates',
        columns: [
          'The natural home for existing O11 applications.',
          'Moving from O11 is a planned re-platforming, application by application.'
        ]
      },
      {
        topic: 'New projects',
        columns: [
          'Sensible where self-managed hosting or an existing O11 estate matters.',
          'Often the starting point for a new cloud-based build.'
        ]
      }
    ],
    chooseWhen: [
      {
        title: 'Choose O11 when',
        points: [
          'You already run an O11 estate.',
          'Your hosting must be self-managed.',
          'A migration is not on the roadmap yet.'
        ]
      },
      {
        title: 'Choose ODC when',
        points: [
          'You are starting a new application.',
          'You want a managed cloud service.',
          'You want to deploy parts of an application independently.'
        ]
      }
    ],
    howWeDecide: 'We look at what you already run, where your data must live and how you want to operate it. If you have O11 applications today, we can map which ones should stay, which should move and in what order.',
    picker: {
      options: [
        {
          id: 'o11',
          label: 'O11',
          reason: 'Your priorities point to O11: established architecture with self-managed hosting options.'
        },
        {
          id: 'odc',
          label: 'ODC',
          reason: 'Your priorities point to ODC: cloud-native managed delivery with independent deployments.'
        }
      ],
      blendLabel: 'A planned path: keep O11 where it is, build new work on ODC',
      blendReason: 'Running your existing applications on O11 while building greenfield services on ODC protects current operations and opens a smooth modernisation path.',
      chips: [
        { id: 'already-o11', label: 'We already run O11', weights: { o11: 2 } },
        { id: 'self-managed', label: 'Hosting must be self-managed', weights: { o11: 3 } },
        { id: 'no-migration', label: 'No migration planned', weights: { o11: 1 } },
        { id: 'new-app', label: 'New application', weights: { odc: 2 } },
        { id: 'managed-cloud', label: 'Managed cloud service', weights: { odc: 2 } },
        { id: 'independent-deploy', label: 'Independent deployments', weights: { odc: 1 } }
      ]
    },
    seoDescription: 'OutSystems 11 and OutSystems Developer Cloud serve different situations. Part of the RHSP PEG Board.'
  },

  'cloud-vs-on-premises': {
    slug: 'cloud-vs-on-premises',
    tileTitle: 'Cloud vs on-premises',
    tileDescription: 'Where your data and applications live.',
    quickTake: 'Does your data need to stay inside your walls?',
    h1: 'Cloud or on-premises: where it runs',
    summary: 'A hosting choice with consequences for control, speed and operations.',
    intro: 'Both can be secure and compliant. The difference is who operates the infrastructure and how quickly you can begin.',
    tableHeaders: ['Topic', 'Cloud', 'On-premises'],
    tableRows: [
      {
        topic: 'Time to start',
        columns: [
          'Environments are available quickly.',
          'Needs hardware or a private environment prepared first.'
        ]
      },
      {
        topic: 'Data control',
        columns: [
          'Data lives with the provider\'s regions and your configuration.',
          'Data stays inside your own walls and network.'
        ]
      },
      {
        topic: 'Operations',
        columns: [
          'The provider runs the infrastructure.',
          'Your team, or a partner, runs it.'
        ]
      },
      {
        topic: 'Scaling',
        columns: [
          'Capacity grows and shrinks with demand.',
          'Capacity is planned and provisioned in advance.'
        ]
      },
      {
        topic: 'Cost pattern',
        columns: [
          'Usage-based and operational.',
          'Up-front investment with a more predictable running pattern.'
        ]
      },
      {
        topic: 'Compliance',
        columns: [
          'Shared responsibility with the provider.',
          'Responsibility sits with you, with full visibility.'
        ]
      }
    ],
    tableNote: 'Data protection duties, including those under India\'s Digital Personal Data Protection Act 2023, apply wherever you host. The hosting choice changes who operates the controls, not whether they are needed.',
    chooseWhen: [
      {
        title: 'Choose cloud when',
        points: [
          'You need to start in weeks.',
          'Demand varies through the year.',
          'You prefer the provider to run the infrastructure.'
        ]
      },
      {
        title: 'Choose on-premises when',
        points: [
          'Data must stay inside your own network.',
          'You have existing data-centre capacity.',
          'Your policies require full operational control.'
        ]
      }
    ],
    howWeDecide: 'Some organisations choose both: sensitive data stays inside their walls while applications run in the cloud. Our Sovereign AI work runs entirely inside the client\'s perimeter for this reason.',
    picker: {
      options: [
        {
          id: 'cloud',
          label: 'Cloud',
          reason: 'Your priorities point to cloud hosting: fast setup, elastic scale, and infrastructure operated by the provider.'
        },
        {
          id: 'on-premises',
          label: 'On-premises',
          reason: 'Your priorities point to on-premises hosting: sensitive data resides inside your walls with full perimeter visibility.'
        }
      ],
      blendLabel: 'A hybrid: sensitive data inside your walls, applications in the cloud',
      blendReason: 'A hybrid hosting model keeps restricted data stores within your local perimeter while running user-facing frontends and stateless compute in the cloud.',
      chips: [
        { id: 'data-inside-walls', label: 'Data must stay inside our walls', weights: { 'on-premises': 3 } },
        { id: 'existing-datacenter', label: 'Existing data-centre capacity', weights: { 'on-premises': 1 } },
        { id: 'full-op-control', label: 'Full operational control', weights: { 'on-premises': 2 } },
        { id: 'start-in-weeks', label: 'Start in weeks', weights: { cloud: 2 } },
        { id: 'demand-varies', label: 'Demand varies', weights: { cloud: 1 } },
        { id: 'provider-runs-infra', label: 'Provider runs the infrastructure', weights: { cloud: 2 } }
      ]
    },
    seoDescription: 'A hosting choice with consequences for control, speed and operations. Part of the RHSP PEG Board.'
  },

  'low-code-vs-high-code': {
    slug: 'low-code-vs-high-code',
    tileTitle: 'Low-code vs high-code vs hybrid',
    tileDescription: 'Three ways to build, one way to decide.',
    quickTake: 'Is your process mostly standard, or mostly unique?',
    h1: 'Low-code, high-code or hybrid',
    summary: 'Three ways to build, and how we choose between them.',
    intro: 'Low-code uses a visual platform such as OutSystems. High-code uses a stack such as MERN. Hybrid combines them in one solution.',
    tableHeaders: ['Topic', 'Low-code', 'High-code', 'Hybrid'],
    tableRows: [
      {
        topic: 'Speed',
        columns: [
          'Fastest to a first release.',
          'Slower to start, steady afterwards.',
          'Fast for the core, deliberate for the custom parts.'
        ]
      },
      {
        topic: 'Flexibility',
        columns: [
          'Broad within the platform.',
          'Unlimited.',
          'Broad, with room for the unusual.'
        ]
      },
      {
        topic: 'Maintenance',
        columns: [
          'Visual, with platform tooling.',
          'Engineering-led.',
          'Two skill sets, one plan.'
        ]
      },
      {
        topic: 'Ownership',
        columns: [
          'Platform-based.',
          'Entirely yours.',
          'A mix, defined up front.'
        ]
      },
      {
        topic: 'Typical case',
        columns: [
          'Workflow and portal applications.',
          'Products with a distinctive experience.',
          'Enterprise processes with a few unusual requirements.'
        ]
      }
    ],
    chooseWhen: [
      {
        title: 'Choose low-code when',
        points: [
          'Time to value matters most.',
          'Your process is mostly workflows.'
        ]
      },
      {
        title: 'Choose high-code when',
        points: [
          'The experience is highly distinctive.',
          'You want complete ownership.'
        ]
      },
      {
        title: 'Choose hybrid when',
        points: [
          'Most of the process is standard and a few parts are unique.',
          'You want speed and freedom together.'
        ]
      }
    ],
    howWeDecide: 'We start from your outcome, your timeline and who will maintain the system. Then we pick the lightest approach that meets all three.',
    picker: {
      options: [
        {
          id: 'low-code',
          label: 'Low-code',
          reason: 'Your priorities point to low-code: visual development delivers standard workflows in the shortest window.'
        },
        {
          id: 'high-code',
          label: 'High-code',
          reason: 'Your priorities point to high-code: complete ownership and bespoke architectural freedom.'
        },
        {
          id: 'hybrid',
          label: 'Hybrid',
          reason: 'Your priorities point to hybrid: standard workflows move quickly on low-code while unique modules are engineered in high-code.'
        }
      ],
      blendLabel: 'Hybrid',
      blendReason: 'Your balanced criteria benefit from a hybrid architecture combining visual acceleration with custom high-code engineering.',
      chips: [
        { id: 'weeks-not-months', label: 'Weeks, not months', weights: { 'low-code': 2 } },
        { id: 'maintain-visually', label: 'Team maintains it visually', weights: { 'low-code': 1 } },
        { id: 'unique-process', label: 'Highly unique process', weights: { 'high-code': 2 } },
        { id: 'complete-ownership', label: 'Complete code ownership', weights: { 'high-code': 2 } },
        { id: 'standard-core-unusual-parts', label: 'Standard core with a few unusual parts', weights: { hybrid: 3 } },
        { id: 'speed-and-freedom', label: 'Speed and freedom together', weights: { hybrid: 2 } }
      ]
    },
    seoDescription: 'Three ways to build, and how we choose between them. Part of the RHSP PEG Board.'
  }
};
