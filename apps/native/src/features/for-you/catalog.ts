/** The prototype catalog is replaceable by a CMS response without changing the UI. */
export type Interest = {
  id: string;
  title: string;
  shortTitle: string;
  question?: string;
  preferences: string[];
  limit?: number;
};

export const interests: Interest[] = [
  {
    id: "jobs",
    title: "Jobs",
    shortTitle: "Jobs",
    question: "Which areas interest you?",
    preferences: [
      "IT & Digital",
      "Business & Governance",
      "Healthcare",
      "Engineering & Technical",
      "Finance",
      "Education",
      "Customer & Technical Support",
      "Other",
    ],
    limit: 3,
  },
  {
    id: "education",
    title: "Scholarships & Education",
    shortTitle: "Scholarships",
    question: "What types interest you most?",
    preferences: [
      "Undergraduate",
      "Graduate/Postgraduate",
      "Professional & Skills Training",
      "Research",
    ],
  },
  {
    id: "immigration",
    title: "Immigration",
    shortTitle: "Immigration",
    question: "Which destinations interest you?",
    preferences: [
      "Canada",
      "United States",
      "United Kingdom",
      "Australia",
      "Europe",
      "Other",
    ],
  },
  {
    id: "grants",
    title: "Grants & Funding",
    shortTitle: "Grants",
    preferences: [
      "Business Grants",
      "Research & Academic",
      "Community & NGO",
      "Professional/Individual",
    ],
  },
  {
    id: "business",
    title: "Business & Entrepreneurship",
    shortTitle: "Business",
    preferences: [
      "Startup Opportunities",
      "Funding & Investment",
      "Tenders & Contracts",
      "Accelerators & Incubators",
    ],
  },
  {
    id: "technology",
    title: "Technology",
    shortTitle: "Technology",
    preferences: [
      "AI & Data",
      "Software & Cloud",
      "Cybersecurity",
      "Digital Innovation",
    ],
  },
  {
    id: "internships",
    title: "Internships & Fellowships",
    shortTitle: "Internships",
    preferences: [
      "Internships",
      "Fellowships",
      "Graduate Programs",
      "Apprenticeships",
    ],
  },
  {
    id: "events",
    title: "Competitions & Events",
    shortTitle: "Events",
    preferences: [
      "Competitions & Awards",
      "Conferences",
      "Hackathons & Challenges",
      "Networking Events",
    ],
  },
  {
    id: "career",
    title: "Career & Professional Development",
    shortTitle: "Career",
    preferences: [
      "Certifications & Training",
      "Career Advice",
      "Mentorship",
      "Leadership Development",
    ],
  },
  {
    id: "community",
    title: "Community & Volunteering",
    shortTitle: "Community",
    preferences: [
      "Volunteer Opportunities",
      "NGO & Social Impact",
      "Community Programs",
    ],
  },
  { id: "comedy", title: "Comedy", shortTitle: "Comedy", preferences: [] },
  {
    id: "communication",
    title: "Communication",
    shortTitle: "Communication",
    preferences: [],
  },
  { id: "ai", title: "AI", shortTitle: "AI", preferences: [] },
];

export type Opportunity = {
  id: string;
  canonicalId: string;
  title: string;
  category: string;
  tags: string[];
  kind: "opportunity" | "news";
  provider: string;
  location: string;
  summary: string;
  overview: string;
  sourceUrl: string;
  sourceType: "official" | "verified";
  publishedAt: string;
  deadline?: string;
  trending: number;
  details: Record<string, string>;
};

// Fixed, fictional examples: never manufacture a rolling deadline or claim live vacancies.
const publishedAt = "2026-11-12T10:00:00Z";
const example = (
  item: Pick<
    Opportunity,
    | "id"
    | "title"
    | "category"
    | "tags"
    | "provider"
    | "location"
    | "summary"
    | "sourceUrl"
    | "details"
  > &
    Partial<Opportunity>
): Opportunity => ({
  canonicalId: item.id,
  kind: "opportunity",
  sourceType: "official",
  publishedAt,
  trending: 20,
  overview: `${item.summary} This is a fictional demonstration. Visit the provider's official website to explore current programs and confirm eligibility, dates, and availability.`,
  ...item,
});
export const opportunities: Opportunity[] = [
  example({
    id: "digital-analyst",
    title: "Senior Business Analyst – Digital Transformation",
    category: "jobs",
    tags: ["IT & Digital", "Business & Governance"],
    provider: "Example Digital Services",
    location: "Canada · Hybrid",
    summary:
      "Help teams deliver accessible digital services and improve everyday experiences.",
    sourceUrl: "https://www.jobbank.gc.ca/",
    deadline: "2026-12-18T23:59:00Z",
    trending: 85,
    details: {
      Location: "Canada",
      "Work arrangement": "Hybrid",
      "Career area": "Business & Governance",
      "Employment type": "Full time",
    },
  }),
  example({
    id: "ai-skills",
    title: "AI Skills Development Program",
    category: "technology",
    tags: ["AI & Data", "Software & Cloud"],
    provider: "Example Learning Initiative",
    location: "Online",
    summary:
      "Build practical AI and cloud skills through a flexible, guided learning program.",
    sourceUrl: "https://www.skills.google/",
    trending: 92,
    details: {
      Format: "Self-paced online learning",
      Focus: "AI & Data",
      Cost: "See official provider",
    },
  }),
  example({
    id: "support-specialist",
    title: "Technical Support Specialist",
    category: "jobs",
    tags: ["Customer & Technical Support", "IT & Digital"],
    provider: "Example Technology Group",
    location: "Canada · Remote",
    summary:
      "Support customers and solve technical problems in a collaborative remote team.",
    sourceUrl: "https://www.jobbank.gc.ca/",
    deadline: "2026-11-21T23:59:00Z",
    details: {
      Location: "Canada",
      "Work arrangement": "Remote",
      "Employment type": "Full time",
      "Career area": "Customer & Technical Support",
    },
  }),
  example({
    id: "immigration-update",
    title: "Canadian Immigration Program Update",
    category: "immigration",
    kind: "news",
    tags: ["Canada"],
    provider: "Example Immigration Bulletin",
    location: "Canada",
    summary:
      "An example of how immigration announcements and program updates appear in your feed.",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    trending: 78,
    details: {
      Destination: "Canada",
      "Program type": "Government update",
      Status: "Illustrative announcement",
    },
  }),
  example({
    id: "graduate-scholarship",
    title: "Graduate Technology Scholarship",
    category: "education",
    tags: ["Graduate/Postgraduate", "AI & Data", "Canada"],
    provider: "Example University",
    location: "Canada",
    summary:
      "Explore a sample funding opportunity for graduate study in technology and data.",
    sourceUrl:
      "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng",
    deadline: "2026-11-25T23:59:00Z",
    trending: 89,
    details: {
      Country: "Canada",
      "Study level": "Graduate/Postgraduate",
      Funding: "Illustrative tuition support",
    },
  }),
  example({
    id: "uk-programs",
    title: "Understanding UK Skilled Worker Updates",
    category: "immigration",
    tags: ["United Kingdom"],
    provider: "Example Migration Review",
    location: "United Kingdom",
    kind: "news",
    summary:
      "A plain-language example of destination-specific immigration information.",
    sourceUrl: "https://www.gov.uk/skilled-worker-visa",
    details: {
      Destination: "United Kingdom",
      "Program type": "Skilled Worker",
      Status: "Information",
    },
  }),
  example({
    id: "community-grant",
    title: "Community Innovation Grant",
    category: "grants",
    tags: ["Community & NGO", "Digital Innovation"],
    provider: "Example Community Foundation",
    location: "International",
    summary:
      "Support community-led ideas that widen access to useful technology.",
    sourceUrl: "https://www.grants.gov/",
    deadline: "2026-12-05T23:59:00Z",
    details: {
      Funding: "Illustrative project grant",
      Audience: "Community organizations",
    },
  }),
  example({
    id: "startup-accelerator",
    title: "Early-stage Startup Accelerator",
    category: "business",
    tags: ["Startup Opportunities", "Accelerators & Incubators"],
    provider: "Example Startup Network",
    location: "Online",
    summary:
      "An example program combining mentorship, workshops, and founder connections.",
    sourceUrl: "https://www.ycombinator.com/",
    trending: 73,
    details: { Format: "Online cohort", Audience: "Early-stage founders" },
  }),
  example({
    id: "research-fellowship",
    title: "Digital Research Fellowship",
    category: "internships",
    tags: ["Fellowships", "Research", "AI & Data"],
    provider: "Example Research Institute",
    location: "Europe",
    summary:
      "Work alongside researchers on projects with practical social impact.",
    sourceUrl: "https://euraxess.ec.europa.eu/",
    deadline: "2026-12-01T23:59:00Z",
    details: {
      Type: "Fellowship",
      Region: "Europe",
      Focus: "Digital research",
    },
  }),
  example({
    id: "innovation-challenge",
    title: "Open Innovation Challenge",
    category: "events",
    tags: ["Hackathons & Challenges", "Digital Innovation"],
    provider: "Example Innovation Forum",
    location: "Online",
    summary:
      "Develop a practical idea with other builders in an inclusive online challenge.",
    sourceUrl: "https://www.eventbrite.com/",
    deadline: "2026-11-20T23:59:00Z",
    details: { Format: "Online challenge", Audience: "Open to teams" },
  }),
  example({
    id: "career-mentor",
    title: "Build Your Next Career Chapter",
    category: "career",
    tags: ["Mentorship", "Career Advice"],
    provider: "Example Careers Collective",
    location: "Online",
    summary:
      "A sample mentorship resource for making thoughtful career decisions.",
    sourceUrl: "https://www.careeronestop.org/",
    details: { Format: "Mentoring and resources", Focus: "Career development" },
  }),
  example({
    id: "volunteer-digital",
    title: "Volunteer Your Digital Skills",
    category: "community",
    tags: ["Volunteer Opportunities", "NGO & Social Impact"],
    provider: "Example Volunteer Network",
    location: "Online",
    summary:
      "Use your skills to support organizations working on community priorities.",
    sourceUrl: "https://www.unv.org/",
    details: { Format: "Online volunteering", Focus: "Social impact" },
  }),
  example({
    id: "comedy-workshop",
    title: "Finding Your Comic Voice",
    category: "comedy",
    tags: [],
    provider: "Example Creative Collective",
    location: "Online",
    summary:
      "Explore storytelling, timing, and creative confidence in a sample workshop.",
    sourceUrl: "https://www.eventbrite.com/",
    details: { Format: "Workshop" },
  }),
  example({
    id: "communication-guide",
    title: "Communicate Ideas With Confidence",
    category: "communication",
    tags: [],
    provider: "Example Speakers Network",
    location: "Online",
    kind: "news",
    summary:
      "Practical communication ideas for work, study, and everyday life.",
    sourceUrl: "https://www.toastmasters.org/",
    details: { Format: "Learning resource" },
  }),
  example({
    id: "ai-open-learning",
    title: "Explore Responsible AI",
    category: "ai",
    tags: ["AI & Data"],
    provider: "Example AI Learning Lab",
    location: "Online",
    summary:
      "An introduction to the opportunities and responsibilities of using AI.",
    sourceUrl: "https://www.elementsofai.com/",
    trending: 95,
    details: { Format: "Online learning", Level: "Introductory" },
  }),
  example({
    id: "closed-scholarship",
    title: "Previous Graduate Scholarship Round",
    category: "education",
    tags: ["Research"],
    provider: "Example University",
    location: "Canada",
    summary: "A closed example, retained only when saved.",
    sourceUrl: "https://www.educanada.ca/",
    deadline: "2026-10-01T23:59:00Z",
    details: { Status: "Closed" },
  }),
];
export const reportReasons = [
  "Expired opportunity",
  "Incorrect information",
  "Suspicious or misleading content",
  "Broken link",
  "Duplicate content",
  "Other",
];
export const interestTitle = (id: string) =>
  interests.find((item) => item.id === id)?.title ?? id;
