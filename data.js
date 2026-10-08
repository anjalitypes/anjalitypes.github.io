// ─────────────────────────────────────────────────────────────
// All portfolio content lives here. Swap the filler for real work.
// `tags` power the search/filter — add as many as you like: skills,
// platforms, industries, tools, any word a visitor might type.
// `showTags` picks which of them are visible on the card.
// ─────────────────────────────────────────────────────────────

const PROFILE = {
  name: "Anjali Patel",
  initials: "AP",
  photo: "images/avatar.jpg", // set to "" to show initials instead
  role: "Product Designer",
  tagline: "Design that ships, converts, and scales",
  taglineSub: "Over 8 years, Anjali has driven $20M+ in revenue as a lead product designer across climate tech, e-commerce, edtech, and healthcare in B2B, B2C, and DTC markets.",
  intro:
    "I'm Anjali Patel's portfolio assistant. Tap a project, or type a tag below to filter.",
  // Each string is a paragraph in the About bubble.
  about: [
    "Anjali Patel is a product designer with 8+ years of experience building mobile-first B2C and B2B SaaS products. She also spent 3+ years leading design teams. She specializes in AI-powered features, design systems, and 0-to-1 product work.",
    "Currently she is a Senior Product Designer at Everyday Electric, a clean tech company founded by leaders from Google Nest and Google AI Labs.",
  ],
  email: "ap@anjali-patel.com",
  // Résumé is hidden for now. To bring it back, put the PDF in files/, a
  // page-one image in images/, and restore this (the viewer code is still there):
  // resume: { file: "files/anjali-patel-resume.pdf", preview: "images/resume-preview.jpg",
  //   downloadName: "Anjali-Patel-Resume.pdf", title: "Anjali Patel — Resume", meta: "PDF · 2 pages · 1 MB" },
  resume: null,
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/anjalipat3l" },
  ],
};

const PROJECTS = [
  {
    id: "litcharts-ai",
    title: "Building an AI product suite",
    company: "LitCharts",
    year: "",
    role: "Lead Product Designer",
    summary: "To meet LitCharts' ambitious roadmap of four AI tools and a new subscription plan, Anjali designed Ask LitCharts AI to scale to every tool that followed.",
    // All tags are searchable; only `showTags` appear on the card.
    tags: ["ai", "edtech", "chatbot", "systems", "scale", "growth", "cro", "conversion", "branding", "strategy", "ux", "ui", "responsive", "web", "tablet", "mobile", "figma", "codepen", "coding", "html", "css", "leadership", "kano survey", "0 to 1", "product strategy", "roadmap planning", "amplitude", "hotjar", "b2b", "b2c", "research"],
    showTags: ["Edtech", "AI", "Growth"],
    image: "images/litcharts-ai.webp",
    stats: [["↑ 75%", "Conversion rate"], ["↑ 40%", "YOY revenue"]],
    // Full case study shown in the project panel (projects without one show placeholders)
    caseStudy: {
      overview: "LitCharts is an edtech SaaS platform that helps students analyze literature and gives teachers the tools to teach it. With AI study tools flooding the market and our own users requesting AI features, LitCharts set out to create their first AI tool, Ask LitCharts AI.",
      facts: [
        ["Role", "Lead Product Designer, Manager"],
        ["Team", "Direct report, engineers, product managers, CEO"],
        ["Tools", "Figma, Adobe, CodePen, Amplitude, Jira, Confluence"],
        ["Timeline", "14 weeks"],
      ],
      sections: [
        {
          heading: "Challenge",
          body: [
            "AI-powered study tools were saturating the market. A Kano survey confirmed our users wanted AI features too. Ask LitCharts AI was the first of four SaaS tools on the year's roadmap. Its design needed to scale so all four could ship before the start of the school year and launch a new subscription tier.",
          ],
        },
        {
          heading: "Results",
          body: [
            "The responsive design drew on established AI patterns to feel immediately intuitive, while brand-specific elements made it unmistakably LitCharts.",
            "It became the top-converting feature in company history, 75% higher than the previous best.",
            "The component system scaled seamlessly to three teacher AI tools that followed, all shipping on time.",
            "Together they anchored a new Teacher Tier that contributed to 40% YOY revenue growth, with zero change in retention despite price increases.",
          ],
          stats: [
            ["75%", "Increase in conversion over prior top feature"],
            ["40%", "Increase in year over year revenue"],
            ["0%", "Change in churn rate and retention"],
          ],
        },
        {
          images: [
            { src: "https://framerusercontent.com/images/dZmiwVr3LyDaawlqpZRuYibXA.gif", alt: "Ask LitCharts AI on a phone: a question is asked and the answer animates in" }, // animated GIF from anjali-patel.com
            { src: "images/litcharts-ai-competitive-analysis.png", alt: "Competitive analysis of AI tools: entity names, tool names, and logo styles across 19 products", mobile: false },
          ],
        },
        {
          heading: "Process",
          body: [
            "I led end-to-end design while mentoring a direct report, paired with engineering on feasibility, and partnered with product on feature direction:",
          ],
          steps: [
            ["Research & Analysis", "I conducted a competitive analysis across AI giants and education-specific tools and identified common UX patterns."],
            ["Ideation", "Through exploration, a running chat interface emerged as the more familiar and scalable UX pattern. I made the case and secured approval to change the specs."],
            ["Micro-interactions", "I studied these in CodePen, building a motion toolkit that gave engineering the confidence to commit to animation as a quality baseline."],
            ["Strategy", "When the Product VP raised concerns about trading design quality for speed, I proposed two solutions: CSS rules written directly into design specs, and scalable React components to carry all four AI tools without rebuilding from scratch."],
            ["Handoff & Delivery", "The CSS-in-specs process gave engineering everything they needed to build quickly. The component system meant subsequent tools required no structural redesign, just new UX on an already-proven foundation."],
          ],
        },
        {
          images: [
            { src: "images/litcharts-ai-desktop.webp", alt: "Ask LitCharts AI on a laptop: the question form beside a chat answering a question about The Great Gatsby" },
          ],
        },
        {
          quote: "The CSS specs helped us create the most responsive feature to date and eliminated the need for javascript to handle responsiveness like some of our legacy features.",
          by: "Alan Nguyen",
          byTitle: "Engineering Manager, LitCharts",
        },
        {
          heading: "Takeaways",
          body: [
            "Ask LitCharts AI not only launched on time, but it became the highest converting feature in company history. The feature's component strategy enabled quick iteration of the three AI tools that followed. All elements of the roadmap shipped before the school year, leading to 40% YOY revenue growth and zero change in retention despite price increases. None of it would have been possible without cross-functional collaboration.",
            "Designing for AI also taught me that the hardest problem isn't the happy path, it's building user confidence when the system behaves unexpectedly. If I were doing it again, I'd have tailored each tool's interaction patterns to its use case, but the shared foundation was the right call under the constraints we had.",
          ],
        },
      ],
    },
    color: "#E8E3FF",
    featured: true,
  },
  {
    id: "cliffsnotes-design-system",
    title: "Scaling a design system",
    company: "CliffsNotes",
    year: "",
    role: "Product Designer",
    summary: "CliffsNotes' design system was built from the ground up by leveraging the LitCharts system as a foundation and scaling it to meet tight timelines.",
    tags: ["design systems", "edtech", "web", "tablet", "mobile", "accessibility", "wcag", "scale", "strategy", "tokens", "figma", "data visualizations", "cro", "information hierarchy", "github", "leadership", "0 to 1", "react", "b2c", "data viz", "responsive", "components", "variants"],
    showTags: ["Design Systems", "Data Viz", "Responsive"],
    image: "images/cliffsnotes-design-system.webp",
    stats: [["20%", "Time savings"], ["20+", "Adoption"]],
    // Full case study shown in the project panel (from anjali-patel.com/cases/design-systems)
    caseStudy: {
      overview: "LitCharts and CliffsNotes are two of EdTech's most recognized SaaS literature platforms. When I joined LitCharts, the design workflow was fragmented: outdated Sketch files, bloated components, and limited visibility across teams. I led the migration to Figma from the ground up and leveraged it to create CliffsNotes' foundational design system.",
      facts: [
        ["Role", "Lead Product Designer, Manager"],
        ["Team", "Direct report, engineers, product managers, CEO"],
        ["Tools", "Figma, Storybook, GitHub, HTML / CSS, React, Adobe"],
        ["Timeline", "2021 to 2025"],
      ],
      sections: [
        {
          heading: "Challenge",
          body: [
            "When I joined LitCharts, the design workflow was inefficient and slowing cross-functional collaboration down. I recognized that moving to Figma was a strategic investment in speed, scalability, and alignment; but first I needed buy-in.",
          ],
        },
        {
          heading: "Results",
          body: [
            "I presented a clear plan to leadership and secured dedicated time to do the Sketch-to-Figma migration.",
            "The LitCharts design system became the foundation for how the organization designed and built.",
            "When CliffsNotes joined the Learneo family, I leveraged LitCharts' system to build foundational system elements saving build time by 20-30%.",
            "In another step toward tighter design-to-build translation, I paired with a lead engineer on a Storybook integration.",
          ],
          stats: [
            ["2", "Design systems"],
            ["20%", "Time savings"],
            ["20+", "Adoption rate"],
          ],
        },
        {
          images: [
            { src: "https://framerusercontent.com/images/FCRSIfAGKhZRDs6nFT91lfErpBc.png?scale-down-to=2048", alt: "Design system components" },
            { src: "https://framerusercontent.com/images/5crHjirYbcmo0UH50jMrpYtT7Q.gif", alt: "Design system in use, animated" },
          ],
        },
        {
          heading: "Process",
          body: [
            "I led the design systems initiative end-to-end, from securing leadership buy-in to mentoring the cross-functional team on systems thinking.",
          ],
          steps: [
            ["Sketch-to-Figma Migration", "I led the Sketch-to-Figma migration, auditing every component, removing redundancies, and establishing a scalable foundation for LitCharts."],
            ["LitCharts Design System", "I built a design system with tokens, variables, styles, components, and documentation. This created a source of truth for design across the organization."],
            ["Engineering Partnership", "When the engineering lead wanted to explore a Storybook integration, we paired on this initiative to improve QA and reduce translation gaps for the team."],
            ["Scaling to CliffsNotes", "After acquiring CliffsNotes, it came without a design system. To hit the ground running, I strategically reused the LitCharts system's foundations by reskinning components for the CliffsNotes design system and developing new ones as needed. What could have been a full rebuild became a fast, focused adaptation."],
          ],
        },
        {
          images: [
            { src: "https://framerusercontent.com/images/GWwuCrjAX4vaiZPVWO7AsomXWU.png?scale-down-to=2048", alt: "CliffsNotes design system built on the LitCharts foundation" },
          ],
        },
        {
          quote: "Reusing the LitCharts design system for CliffsNotes made development 20-30% faster.",
          by: "Jeff Cohen",
          byTitle: "Senior Engineer, LitCharts",
        },
        {
          heading: "Takeaways",
          body: [
            "These design systems didn't just improve our products, it changed how the org worked together. Designers, PMs, and engineers shared a common vocabulary, handoff became seamless, and the system proved it could scale when it mattered most.",
            "If I had more time, even though the fast adaptation was the right call, I would have developed CliffsNotes' foundational elements further to differentiate its brand identity at the foundational level. One of the biggest things I learned along the way was to keep up with every major Figma release. Each one was an opportunity to rethink the system.",
          ],
        },
      ],
    },
    color: "#DDF2E7",
    featured: true,
  },
  {
    id: "abc-product-page",
    title: "Redesigning a product page",
    company: "abc carpet & home",
    year: "",
    role: "Lead Product Designer",
    summary: "abc carpet & home shoppers needed reassurance to feel confident buying online, so the team set out to redesign the product detail page.",
    tags: ["e-commerce", "figma", "full story", "0 to 1", "miro", "a/b testing", "google analytics", "react", "cro", "dtc", "research", "web", "mobile"],
    showTags: ["E-commerce", "CRO", "0 to 1"],
    image: "images/abc-product-page.webp",
    stats: [["↑ 81%", "Revenue"], ["↑ 55%", "Avg order value"]],
    // Full case study shown in the project panel (from anjali-patel.com/cases/abc)
    caseStudy: {
      overview: "As a luxury home furnishings retailer, abc carpet & home's products were underperforming online. The product detail page was a critical entry point into the purchase funnel with product types spanning everything from furniture to jewelry. We set out to redesign these pages.",
      facts: [
        ["Role", "Founding Product Designer"],
        ["Team", "Product managers, external developers, editorial team"],
        ["Tools", "Figma, FullStory, Adobe, Google Analytics, Sheets, Google Optimize, Miro"],
        ["Timeline", "12 weeks"],
      ],
      sections: [
        {
          heading: "Challenge",
          body: [
            "Redesigning the product detail page was a top priority for leadership. With average order values over $700, shoppers needed more reassurance to feel confident buying online.",
          ],
        },
        {
          heading: "Results",
          body: [
            "The new product detail page elevated high-value content to the top fold, giving shoppers the information they needed when it mattered most.",
            "An A/B test running just over two weeks made the results clear: revenue increased by 81%, average order value jumped 55%, and per session value nearly doubled.",
          ],
          stats: [
            ["81%", "Increase in revenue"],
            ["55%", "Increase in AOV"],
            ["16%", "Increase in conversion"],
          ],
        },
        {
          images: [
            { src: "https://framerusercontent.com/images/BPz2PPWUUSkiLj6zarUWUAVBUc.png?scale-down-to=2048", alt: "Redesigned abc carpet & home product detail page" },
          ],
        },
        {
          heading: "Process",
          body: [
            "I partnered closely with product managers, an external agency, and cross-functional teams to drive the product page redesign from research through launch.",
          ],
          steps: [
            ["Research & Analysis", "I proactively created a research tracker to keep in-house and external teams aligned. FullStory, personas, and competitor analysis surfaced two findings: elevate high-value content above the fold and reduce flow friction."],
            ["UX Strategy", "I defined the ideal page structure across four zones: Hero, Inspiration, Storytelling, and Discovery, but scoped down the sections for MVP to keep the team focused on validating the core experience before adding complexity. In presenting to stakeholders, we aligned on an MVP that best supported our brand and users."],
            ["UI & Agency Collaboration", "I worked hand-in-hand with the external design technologist: whiteboarding, pairing, and leading design direction throughout to ensure the vision didn't get lost in translation. As the founding designer at abc, I advocated for an A/B test to quantify UX impact for the company."],
            ["Handoff & QA", "Once design, data, and content were fully approved, I led handoff and partnered with the agency through an extensive QA process to bring the vision to life."],
          ],
        },
        {
          images: [
            { src: "https://framerusercontent.com/images/ph1EmGe6j7brbEmIx0N48dtA0.png?scale-down-to=2048", alt: "Product detail page design details" },
          ],
        },
        {
          quote: "Our redesign delivered the strongest A/B test results we've seen: increases of 81% in revenue and 55% in AOV.",
          by: "Megan Tiejen",
          byTitle: "Product Manager, abc carpet & home",
        },
        {
          heading: "Takeaways",
          body: [
            "The A/B results were clear: 81% revenue increase, 55% jump in average order value, and per session value nearly doubled. The numbers validated the approach, but the process made them possible. Front-loading alignment saved time at launch. Designing with engineering in mind reduced friction from day one.",
            "With more runway I would have launched more of the page sections we scoped for phase two from the start. This project taught me that being a founding designer means selling the process as much as the output. The A/B test wasn't just validation, it was how I earned the trust org-wide to keep experimenting.",
          ],
        },
      ],
    },
    color: "#FFE9D6",
    featured: true,
  },
];

// Work history for the About timeline, newest first. `tags` show on each row.
const EXPERIENCE = [
  { company: "Everyday Electric", role: "Senior Product Designer (Contract)", start: "2026", end: "Present", summary: "Growth designer at a clean tech startup founded by leaders from Google Nest and Google AI Labs.", tags: ["climate tech", "b2c", "b2b", "growth"] },
  { company: "Freelance", role: "UX Design Consultant", start: "2026", end: "2026", summary: "Branding, and onboarding for VibrantLifeMD, a stealth startup, and a vet hospital.", tags: ["healthcare", "vet tech", "branding", "b2c", "b2b"] },
  { company: "Learneo", role: "Lead Product Designer, Manager II", start: "2022", end: "2025", summary: "Led the design team and functioned as a player-coach for two platforms. Shipped four AI tools and the highest-converting feature in company history.", tags: ["ai", "edtech", "leadership", "b2b", "b2c", "growth"] },
  { company: "Course Hero", role: "Product Designer", start: "2021", end: "2022", summary: "0-to-1 designs for LitCharts and CliffsNotes. Led the Sketch → Figma migration and built design systems from scratch.", tags: ["edtech", "0→1", "design systems", "b2c", "b2b"] },
  { company: "abc carpet & home", role: "Product Designer", start: "2020", end: "2021", summary: "Built the design system and UX process from scratch. A new product detail page drove an 81% revenue lift.", tags: ["e-commerce", "design systems", "dtc"] },
];

// Text-to-speech settings. `preferredVoices` are tried in order (a name
// matches if the browser's voice name starts with it). Falls back to the
// most natural-sounding voice matching `lang`.
// How the voice should say certain words. Keys match on screen text (any
// case, possessives too — "Anjali's" → "Un-juh-lee's"); values are respelled
// phonetically for the speech engine. The on-screen text never changes.
const PRONUNCIATIONS = {
  Anjali: "Un-juh-lee",
  Patel: "Puh-tell",
  edtech: "ed-tech",
  lead: "leed",
  SaaS: "sass",
};

const VOICE = {
  lang: "en-US",
  rate: 0.92, // a touch slower reads smoother
  pitch: 1,
  // American male voices, best first
  preferredVoices: [
    "Aaron", // macOS / iOS
    "Microsoft Guy Online (Natural)", // Edge
    "Microsoft Andrew Online (Natural)", // Edge
    "Google US English", // Chrome
  ],
};

// Topics with their own reply: copy + visual. `related` lists projects with that
// tag underneath; otherwise the reply offers to show the case studies.
const SPECIAL_TOPICS = [
  {
    id: "healthcare",
    match: /\b(health ?care|health ?tech|healthtech|health|medical|medicine|telehealth|telemedicine|wellness|clinic|vibrantlife(md)?)\b/i,
    chip: "Healthcare work",
    body: "There isn't a case study for healthcare at the moment, but Anjali has freelanced and developed onboarding flows and landing pages for different healthcare companies. One was developed for VibrantLifeMD. She not only developed the UX strategy, but also made a brand kit for the business to use across the platform as well as social media.",
    image: { src: "images/vibrantlife.webp", alt: "VibrantLifeMD landing page: the hero, Meet Dr. Shetal Stewart, Our Services, and the consultation sign-up form" },
  },
  {
    id: "b2b",
    match: /\b(b2b|b2b saas|business[- ]to[- ]business|enterprise|institutions?|group subscriptions?)\b/i,
    chip: "B2B work",
    body: "During her time working on LitCharts, a main part of the business was the B2B side where we marketed to schools and institutions. This was the group landing page redesign she developed to capture more institutions. Once this launched the company received 2x more inquiries for the group subscriptions.",
    image: { src: "images/litcharts-group-landing.webp", alt: "LitCharts group subscription landing page: pricing for student and teacher seats, testimonials, a request-a-quote form, and FAQs" },
    related: "b2b",
  },
  {
    id: "data viz",
    match: /\b(data ?vi[sz]|dataviz|data visuali[sz]ations?|visuali[sz]ations?|charts?|graphs?|diagrams?|infographics?)\b/i,
    chip: "Data viz work",
    body: "Anjali is a diagram fiend at heart! Here are an example of a data visualization she developed for CliffsNotes. Prototype was developed using Figma Make:",
    image: { src: "images/cliffsnotes-data-viz.webp", alt: "CliffsNotes character page with a chart showing how often Junior appears in each chapter, with a slider to explore prevalence by chapter" },
    related: "data viz",
  },
  {
    id: "ai workflow",
    // AI tools and AI-assisted ways of working (a bare "AI" still searches projects)
    match: /\b(claude( code)?|anthropic|codex|open ?ai|chat ?gpt|gpt(-?\d+)?|copilot|cursor|lovable|figma make|v0|bolt|gemini|llms?|vibe[- ]?cod(e|ing)|prompt(s|ing)?|ai[- ]?(assisted|powered|first|native)|ai (workflows?|tools?|coding|prototyping)|(workflows?|coding|prototyping|building) with ai|using ai|how (was|is) this (built|made)|who built this|built this)\b/i,
    chip: "AI workflow",
    body: "Anjali built this chat bot portfolio experience with Claude Code. Beyond this use case she enjoys using AI to make building prototypes faster. The biggest benefit she sees is that it gives designers more time to experiment which raises the craft bar.",
    related: "ai",
  },
  {
    id: "dashboard",
    match: /\b(dashboards?|admin( tools?| panels?)?|internal tools?|analytics|cst)\b/i,
    chip: "Dashboard work",
    body: "Though there are no case studies around dashboards, Anjali has worked on a CST dashboard in the past for LitCharts which was more about functionality than UI. She also has dabbled in dashboard concepts, see images below.",
    images: [
      { src: "images/litcharts-cst-dashboard.webp", alt: "LitCharts Customer Service dashboard: search with filters and a transactions table with an expanded payment row" },
      { src: "images/dashboard-concept.webp", alt: "EduTracker dashboard concept: user and revenue stats, subscription trend chart, page views by category, top features, and recent activity" },
    ],
  },
];

// Quotes from people Anjali has worked with (from anjali-patel.com).
const TESTIMONIALS = [
  {
    quote: "So much of LitCharts has benefited from Anjali's profound curiosity, rigorous thinking, design ingenuity, and her constant focus on serving our users. She's been instrumental in defining our product direction.",
    name: "Ben Florman",
    title: "Co-founder, LitCharts",
    photo: "https://framerusercontent.com/images/NckHgvP7qtq6FEJjjyV3TD97WQ.png?width=340&height=340",
  },
  {
    quote: "Anjali has helped me grow as a designer. Her outstanding leadership shows in how seamlessly she collaborates with everyone, and her remarkable attention to detail has helped us produce high quality designs.",
    name: "Zainab Hasan",
    title: "Product Designer, Learneo",
    photo: "https://framerusercontent.com/images/q7Hy8p6ErOgXh1axkRRE8WSTNf8.png?scale-down-to=512",
  },
];

// Chips shown under the input. `ask` is sent as if the visitor typed it.
const STARTER_SUGGESTIONS = [
  { label: "AI", ask: "AI" },
  { label: "Mobile", ask: "mobile" },
  { label: "Web", ask: "web" },
  { label: "Systems", ask: "systems" },
  { label: "Research", ask: "research" },
  { label: "About", ask: "Tell me about Anjali Patel" },
  { label: "Testimonials", ask: "What do people say about working with Anjali?" },
  { label: "Contact", ask: "How can I contact Anjali?" },
];

// Filler case-study sections used in the drawer for every project.
const CASE_STUDY_SECTIONS = [
  { heading: "Overview", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam." },
  { heading: "The problem", body: "Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta." },
  { heading: "Process", body: "Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.", image: true },
  { heading: "Solution", body: "Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.", image: true },
  { heading: "Impact", stats: [["+00%", "Metric one"], ["0.0x", "Metric two"], ["00k", "Metric three"]] },
  { heading: "What she learned", body: "In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor." },
];
