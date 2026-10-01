const DEMO_EMAIL_DOMAIN = 'jobconnect-demo.test';

const describe = ({ about, doing, needs }) =>
  [
    about,
    '',
    "What you'll do",
    ...doing.map((d) => `- ${d}`),
    '',
    'What we are looking for',
    ...needs.map((n) => `- ${n}`),
  ].join('\n');

const logo = (name, color) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=${color}&color=ffffff&format=png`;

const companies = [
  {
    key: 'lumina',
    name: 'Lumina Analytics',
    industry: 'Data & Analytics',
    location: 'Berlin, Germany',
    website: 'https://lumina-analytics.test',
    logoUrl: logo('Lumina Analytics', '1e40af'),
    description:
      'Lumina Analytics helps retailers and logistics teams turn messy operational data into decisions. Our platform processes billions of events a day, and our 60-person team is split between Berlin and remote colleagues across Europe.',
    createdDaysAgo: 120,
    recruiter: { name: 'Grace Holloway', location: 'Berlin, Germany' },
  },
  {
    key: 'brightwave',
    name: 'Brightwave Software',
    industry: 'Software Development',
    location: 'Austin, TX, USA',
    website: 'https://brightwave-software.test',
    logoUrl: logo('Brightwave Software', '0f766e'),
    description:
      'Brightwave is a product studio that builds web and mobile software for growing companies. We ship in small, senior teams, value clean code and honest feedback, and work remotely across US time zones.',
    createdDaysAgo: 110,
    recruiter: { name: 'Tomás Herrera', location: 'Austin, TX, USA' },
  },
  {
    key: 'harborlight',
    name: 'Harborlight Health',
    industry: 'Digital Health',
    location: 'Toronto, Canada',
    website: 'https://harborlight-health.test',
    logoUrl: logo('Harborlight Health', 'b45309'),
    description:
      'Harborlight builds patient-first tools for clinics: booking, secure messaging and follow-up care plans. We are a privacy-obsessed team of 45 that treats accessibility as a feature, not an afterthought.',
    createdDaysAgo: 100,
    recruiter: { name: 'Aisha Rahman', location: 'Toronto, Canada' },
  },
  {
    key: 'copperline',
    name: 'Copperline Logistics',
    industry: 'Logistics Technology',
    location: 'Manchester, UK',
    website: 'https://copperline-logistics.test',
    logoUrl: logo('Copperline Logistics', '9a3412'),
    description:
      'Copperline runs the software behind regional freight networks: route planning, live tracking and warehouse tooling. We are growing fast and hiring engineers, analysts and customer-facing specialists in Manchester.',
    createdDaysAgo: 95,
    recruiter: { name: 'Callum Reid', location: 'Manchester, UK' },
  },
  {
    key: 'skybridge',
    name: 'Skybridge Fintech',
    industry: 'Financial Technology',
    location: 'Karachi, Pakistan',
    website: 'https://skybridge-fintech.test',
    logoUrl: logo('Skybridge Fintech', '6d28d9'),
    description:
      'Skybridge provides payment and wallet infrastructure for small businesses across South Asia. Security and reliability come first here; our engineers own their services end to end, from design to on-call.',
    createdDaysAgo: 90,
    recruiter: { name: 'Sana Malik', location: 'Karachi, Pakistan' },
  },
  {
    key: 'pixelforge',
    name: 'Pixelforge Studios',
    industry: 'Games & Creative',
    location: 'Montreal, Canada',
    website: 'https://pixelforge-studios.test',
    logoUrl: logo('Pixelforge Studios', 'be123c'),
    description:
      'Pixelforge is an independent studio making story-driven games for PC and console. Our team of 30 mixes programmers, artists and designers who love prototyping, playtesting and shipping.',
    createdDaysAgo: 85,
    recruiter: { name: 'Étienne Roy', location: 'Montreal, Canada' },
  },
];

const candidates = [
  {
    key: 'amara',
    name: 'Amara Okafor',
    phone: '+234 800 555 0142',
    location: 'Lagos, Nigeria',
    bio: 'Frontend engineer with four years of experience building accessible, fast React applications for fintech and e-commerce products. I care about design systems, testing and clear communication.',
    skills: ['react', 'typescript', 'javascript', 'css', 'tailwind css', 'graphql', 'testing library'],
    education: [{ institution: 'University of Northvale', degree: 'BSc', fieldOfStudy: 'Computer Science', startYear: 2015, endYear: 2019 }],
    experience: [
      { title: 'Frontend Engineer', company: 'Kola Payments', startDate: '2022-03-01', description: 'Own the merchant dashboard built with React and TypeScript; cut the bundle size by 35%.' },
      { title: 'Junior Web Developer', company: 'Ade Digital Agency', startDate: '2019-09-01', endDate: '2022-02-28', description: 'Built marketing sites and internal tools for retail clients.' },
    ],
    pitch: 'I have four years of experience building React and TypeScript interfaces, and I enjoy turning complicated flows into simple screens.',
  },
  {
    key: 'liam',
    name: 'Liam Bergström',
    phone: '+46 70 555 0199',
    location: 'Stockholm, Sweden',
    bio: 'Backend engineer focused on reliable APIs and data modelling. Comfortable owning a service from schema design to deployment and monitoring.',
    skills: ['node', 'express', 'mongodb', 'postgresql', 'redis', 'docker', 'aws', 'typescript'],
    education: [{ institution: 'Halden Technical University', degree: 'MSc', fieldOfStudy: 'Software Engineering', startYear: 2014, endYear: 2016 }],
    experience: [
      { title: 'Backend Engineer', company: 'Nordlys Commerce', startDate: '2019-06-03', description: 'Designed the order and inventory APIs that handle 2M requests a day.' },
      { title: 'Software Developer', company: 'Fjordsoft', startDate: '2016-08-15', endDate: '2019-05-31', description: 'Maintained Node.js services and migrated the platform from a monolith to services.' },
    ],
    pitch: 'I build Node.js APIs that stay fast and easy to operate, and I would love to bring that experience to your team.',
  },
  {
    key: 'sofia',
    name: 'Sofía Ramírez',
    phone: '+34 600 555 010',
    location: 'Madrid, Spain',
    bio: 'Full-stack developer who likes shipping whole features: database, API and UI. Five years across startups and agencies.',
    skills: ['react', 'node', 'typescript', 'postgresql', 'docker', 'rest apis', 'git'],
    education: [{ institution: 'Universidad de Costa Alta', degree: 'BSc', fieldOfStudy: 'Computer Engineering', startYear: 2013, endYear: 2017 }],
    experience: [
      { title: 'Full-Stack Developer', company: 'Solmar Labs', startDate: '2020-01-13', description: 'Built booking and payments features end to end with React, Node and PostgreSQL.' },
      { title: 'Web Developer', company: 'Estudio Faro', startDate: '2017-09-01', endDate: '2019-12-20', description: 'Delivered client websites and small web apps.' },
    ],
    pitch: 'I enjoy owning a feature from database to interface, and I have shipped several React and Node products from scratch.',
  },
  {
    key: 'daniel',
    name: 'Daniel Kim',
    phone: '+1 416 555 0175',
    location: 'Toronto, Canada',
    bio: 'Data analyst who turns dashboards into decisions. Three years in retail analytics, with strong SQL and a habit of asking "so what?".',
    skills: ['sql', 'python', 'tableau', 'power bi', 'excel', 'statistics'],
    education: [{ institution: 'Lakeshore University', degree: 'BSc', fieldOfStudy: 'Statistics', startYear: 2016, endYear: 2020 }],
    experience: [
      { title: 'Data Analyst', company: 'Maple & Co Retail', startDate: '2021-02-01', description: 'Built weekly sales and churn dashboards used by 40 store managers.' },
    ],
    pitch: 'I am a SQL-first analyst who likes explaining numbers to non-technical teams and I would be glad to help your data work.',
  },
  {
    key: 'priya',
    name: 'Priya Nair',
    phone: '+91 80 5550 1123',
    location: 'Bengaluru, India',
    bio: 'Machine learning engineer with four years of experience taking models from notebooks to production. Interested in ranking, forecasting and MLOps.',
    skills: ['python', 'pytorch', 'scikit-learn', 'mlops', 'sql', 'docker', 'statistics'],
    education: [{ institution: 'Eastbridge Institute of Technology', degree: 'MSc', fieldOfStudy: 'Data Science', startYear: 2017, endYear: 2019 }],
    experience: [
      { title: 'Machine Learning Engineer', company: 'Tessellate AI', startDate: '2021-07-01', description: 'Shipped a demand forecasting service that reduced stock-outs by 18%.' },
      { title: 'Data Scientist', company: 'Kaveri Analytics', startDate: '2019-08-01', endDate: '2021-06-30', description: 'Built churn and recommendation models for subscription products.' },
    ],
    pitch: 'I have spent four years getting machine learning models into production and monitoring them afterwards.',
  },
  {
    key: 'omar',
    name: 'Omar Haddad',
    phone: '+20 100 555 0166',
    location: 'Cairo, Egypt',
    bio: 'DevOps engineer who automates everything twice. Kubernetes, Terraform and observability are my daily tools.',
    skills: ['kubernetes', 'terraform', 'aws', 'docker', 'ci/cd', 'linux', 'python', 'prometheus'],
    education: [{ institution: 'Redwood State University', degree: 'BSc', fieldOfStudy: 'Information Systems', startYear: 2012, endYear: 2016 }],
    experience: [
      { title: 'DevOps Engineer', company: 'Nile Cloud Services', startDate: '2019-04-01', description: 'Run a 40-node Kubernetes platform with GitOps deployments and 99.95% uptime.' },
      { title: 'Systems Administrator', company: 'Delta Telecom', startDate: '2016-09-01', endDate: '2019-03-15' },
    ],
    pitch: 'I build reliable delivery pipelines and infrastructure as code, and I like teams that treat operations as engineering.',
  },
  {
    key: 'chloe',
    name: 'Chloé Dubois',
    phone: '+33 6 55 50 01 24',
    location: 'Lyon, France',
    bio: 'Product designer with a background in research. I design accessible, calm interfaces and test them with real people early.',
    skills: ['figma', 'user research', 'prototyping', 'ui design', 'accessibility', 'motion design'],
    education: [{ institution: 'Institut Polytechnique de Vernay', degree: 'MA', fieldOfStudy: 'Interaction Design', startYear: 2015, endYear: 2017 }],
    experience: [
      { title: 'Product Designer', company: 'Atelier Lumen', startDate: '2020-05-04', description: 'Led the redesign of a booking app used by 200k people; task success rose from 71% to 92%.' },
      { title: 'UX Researcher', company: 'Studio Rhône', startDate: '2017-10-01', endDate: '2020-04-30' },
    ],
    pitch: 'I combine user research with hands-on interface design, and I would love to help shape your product.',
  },
  {
    key: 'marcus',
    name: 'Marcus Webb',
    phone: '+44 7700 900123',
    location: 'Manchester, UK',
    bio: 'Junior QA engineer moving into test automation. Methodical, curious and happy to learn from senior engineers.',
    skills: ['cypress', 'javascript', 'api testing', 'postman', 'sql', 'git'],
    education: [{ institution: 'Marlowe College', degree: 'HND', fieldOfStudy: 'Computing', startYear: 2020, endYear: 2022 }],
    experience: [
      { title: 'QA Analyst', company: 'Ridgeway Systems', startDate: '2023-01-09', description: 'Wrote manual test plans and started automating regression tests with Cypress.' },
    ],
    pitch: 'I am an early-career QA engineer with hands-on Cypress experience, keen to grow in a supportive engineering team.',
  },
  {
    key: 'hannah',
    name: 'Hannah Schmidt',
    phone: '+49 30 555 0188',
    location: 'Berlin, Germany',
    bio: 'Product manager with six years in B2B SaaS. I like clear problem statements, small experiments and roadmaps people actually understand.',
    skills: ['product management', 'roadmapping', 'user research', 'sql', 'agile', 'stakeholder management'],
    education: [{ institution: 'University of Northvale', degree: 'MBA', fieldOfStudy: 'Technology Management', startYear: 2016, endYear: 2018 }],
    experience: [
      { title: 'Senior Product Manager', company: 'Cirrus Workflow', startDate: '2021-03-01', description: 'Own onboarding and billing; improved activation by 24% over two quarters.' },
      { title: 'Product Manager', company: 'Cirrus Workflow', startDate: '2018-09-01', endDate: '2021-02-28' },
    ],
    pitch: 'I have six years of product experience in B2B software and I enjoy working closely with engineers and customers.',
  },
  {
    key: 'zain',
    name: 'Zain Ahmed',
    phone: '+92 300 555 0134',
    location: 'Karachi, Pakistan',
    bio: 'Recent computer science graduate with an internship in web development and a growing interest in digital marketing.',
    skills: ['javascript', 'react', 'html', 'css', 'seo', 'content writing', 'social media'],
    education: [{ institution: 'Indus Valley Institute', degree: 'BS', fieldOfStudy: 'Computer Science', startYear: 2021, endYear: 2025 }],
    experience: [
      { title: 'Web Development Intern', company: 'Crescent Digital', startDate: '2025-01-06', endDate: '2025-06-27', description: 'Built landing pages and improved page speed for three client sites.' },
    ],
    pitch: 'I am a recent graduate who learns quickly, and I am excited to contribute while I grow.',
  },
  { key: 'jordan', name: 'Jordan Blake' },
];

const jobs = [
  {
    key: 'L1', company: 'lumina', title: 'Senior Data Engineer', jobType: 'full-time', location: 'Berlin, Germany (Hybrid)',
    skills: ['python', 'sql', 'airflow', 'dbt', 'aws'], experienceYears: 5, salary: [75000, 95000, 'EUR'], deadlineDays: 30, postedDaysAgo: 12,
    description: describe({
      about: 'Join the platform team that moves and models the data behind every Lumina dashboard.',
      doing: ['Design and operate batch and streaming pipelines on AWS', 'Model analytics-ready datasets with dbt and keep them tested', 'Mentor engineers and improve our data quality tooling'],
      needs: ['5+ years building production data pipelines', 'Strong Python and SQL; experience with Airflow or similar', 'Care about reliability, documentation and clear communication'],
    }),
  },
  {
    key: 'L2', company: 'lumina', title: 'Data Analyst', jobType: 'full-time', location: 'Berlin, Germany',
    skills: ['sql', 'tableau', 'python', 'excel'], experienceYears: 2, salary: [48000, 62000, 'EUR'], deadlineDays: 21, postedDaysAgo: 6,
    description: describe({
      about: 'Help our retail customers understand what is happening in their business and what to do next.',
      doing: ['Answer business questions with SQL and Tableau', 'Build and maintain customer-facing dashboards', 'Present findings to non-technical stakeholders'],
      needs: ['2+ years in an analytics role', 'Confident SQL; some Python is a plus', 'Clear written and spoken English'],
    }),
  },
  {
    key: 'L3', company: 'lumina', title: 'Machine Learning Engineer', jobType: 'full-time', location: 'Remote (Europe)',
    skills: ['python', 'pytorch', 'mlops', 'docker'], experienceYears: 4, salary: [80000, 105000, 'EUR'], deadlineDays: 45, postedDaysAgo: 20,
    description: describe({
      about: 'Build the forecasting and anomaly-detection models that power our platform.',
      doing: ['Train, evaluate and deploy models to production', 'Own monitoring, retraining and rollout of ML services', 'Work with data engineers and product on new ML features'],
      needs: ['4+ years of applied machine learning', 'Python and PyTorch or similar; comfortable with Docker', 'Experience with model monitoring is a big plus'],
    }),
  },
  {
    key: 'L4', company: 'lumina', title: 'Data Science Intern', jobType: 'internship', location: 'Berlin, Germany',
    skills: ['python', 'statistics', 'sql'], experienceYears: 0, salary: [18000, 24000, 'EUR'], deadlineDays: -5, postedDaysAgo: 40,
    description: describe({
      about: 'A six-month internship working alongside our data science team on real customer problems.',
      doing: ['Explore datasets and prototype models', 'Write clear analyses and share results with the team', 'Support experiments and reporting'],
      needs: ['Currently studying statistics, maths, or computer science', 'Some Python and SQL', 'Curiosity and a willingness to ask questions'],
    }),
  },
  {
    key: 'B1', company: 'brightwave', title: 'Senior Frontend Engineer (React)', jobType: 'full-time', location: 'Austin, TX (Hybrid)',
    skills: ['react', 'typescript', 'css', 'graphql', 'testing library'], experienceYears: 5, salary: [130000, 160000, 'USD'], deadlineDays: 28, postedDaysAgo: 9,
    description: describe({
      about: 'Lead the frontend of a design-heavy SaaS product used by thousands of teams.',
      doing: ['Build and evolve our React and TypeScript design system', 'Improve performance and accessibility across the app', 'Review code and mentor mid-level engineers'],
      needs: ['5+ years of frontend experience, ideally with React and TypeScript', 'An eye for detail and strong opinions about accessibility', 'Experience testing UI code'],
    }),
  },
  {
    key: 'B2', company: 'brightwave', title: 'Backend Engineer (Node.js)', jobType: 'full-time', location: 'Remote (US)',
    skills: ['node', 'express', 'mongodb', 'docker', 'aws'], experienceYears: 3, salary: [110000, 140000, 'USD'], deadlineDays: 35, postedDaysAgo: 4,
    description: describe({
      about: 'Build the APIs and background services behind our client products.',
      doing: ['Design REST APIs with Node.js, Express and MongoDB', 'Write tests and keep services observable', 'Collaborate closely with frontend and design'],
      needs: ['3+ years with Node.js in production', 'Solid database design skills', 'Comfortable with Docker and cloud deployment'],
    }),
  },
  {
    key: 'B3', company: 'brightwave', title: 'Full-Stack Developer (6-month contract)', jobType: 'contract', location: 'Remote',
    skills: ['react', 'node', 'postgresql'], experienceYears: 3, salary: [90000, 110000, 'USD'], deadlineDays: 14, postedDaysAgo: 15,
    description: describe({
      about: 'Help us deliver a client project on a tight timeline, with a chance to extend.',
      doing: ['Build features across a React front end and Node.js API', 'Work in a small senior team with weekly demos', 'Document your work for the client handover'],
      needs: ['3+ years of full-stack experience', 'Self-directed and comfortable communicating async', 'Availability for a 6-month engagement'],
    }),
  },
  {
    key: 'B4', company: 'brightwave', title: 'QA Automation Engineer', jobType: 'full-time', location: 'Austin, TX', status: 'closed',
    skills: ['cypress', 'javascript', 'ci/cd', 'api testing'], experienceYears: 2, salary: [85000, 105000, 'USD'], postedDaysAgo: 30,
    description: describe({
      about: 'This position has been filled. Thank you to everyone who applied.',
      doing: ['Build and maintain end-to-end test suites with Cypress', 'Integrate tests into our CI pipeline', 'Partner with developers on test strategy'],
      needs: ['2+ years in QA automation', 'JavaScript and API testing experience', 'A quality-first mindset'],
    }),
  },
  {
    key: 'H1', company: 'harborlight', title: 'Mobile Developer (Flutter)', jobType: 'full-time', location: 'Toronto, Canada',
    skills: ['flutter', 'dart', 'firebase', 'rest apis'], experienceYears: 3, salary: [95000, 120000, 'CAD'], deadlineDays: 40, postedDaysAgo: 7,
    description: describe({
      about: 'Build the patient app that helps people book, prepare for and follow up on care.',
      doing: ['Develop features in Flutter for iOS and Android', 'Integrate with our REST APIs and Firebase services', 'Ship accessible, well-tested screens'],
      needs: ['3+ years of mobile development; Flutter preferred', 'Understanding of privacy-sensitive apps', 'Good communication with designers and clinicians'],
    }),
  },
  {
    key: 'H2', company: 'harborlight', title: 'Product Manager', jobType: 'full-time', location: 'Toronto, Canada (Hybrid)',
    skills: ['product management', 'roadmapping', 'sql', 'user research'], experienceYears: 5, salary: [115000, 145000, 'CAD'], deadlineDays: 25, postedDaysAgo: 11,
    description: describe({
      about: 'Own the roadmap for our clinic-facing tools and work with a small, senior team.',
      doing: ['Discover problems with clinics and patients through research', 'Prioritise and specify work with engineering and design', 'Track outcomes with data and adjust the plan'],
      needs: ['5+ years of product management', 'Comfortable with SQL and product analytics', 'Experience in healthcare or regulated software is a plus'],
    }),
  },
  {
    key: 'H3', company: 'harborlight', title: 'UX Designer (Part-time)', jobType: 'part-time', location: 'Remote (Canada)',
    skills: ['figma', 'user research', 'prototyping', 'accessibility'], experienceYears: 2, salary: [45000, 60000, 'CAD'], deadlineDays: 18, postedDaysAgo: 3,
    description: describe({
      about: 'Three days a week designing calm, accessible experiences for patients and clinic staff.',
      doing: ['Create flows, prototypes and UI in Figma', 'Run usability tests and share the findings', 'Maintain accessibility standards in our design system'],
      needs: ['2+ years of UX or product design', 'A portfolio showing research-driven work', 'Knowledge of WCAG guidelines'],
    }),
  },
  {
    key: 'H4', company: 'harborlight', title: 'Technical Writer (Freelance)', jobType: 'freelance', location: 'Remote',
    skills: ['technical writing', 'markdown', 'api docs'], experienceYears: 2, salary: [40000, 55000, 'CAD'], postedDaysAgo: 25,
    description: describe({
      about: 'Write and edit documentation for our public APIs and clinic onboarding guides.',
      doing: ['Document REST endpoints and integration guides', 'Turn engineering notes into clear how-to articles', 'Keep docs accurate as the product changes'],
      needs: ['2+ years of technical writing', 'Comfortable reading API specs and code samples', 'Excellent editing skills'],
    }),
  },
  {
    key: 'C1', company: 'copperline', title: 'DevOps Engineer', jobType: 'full-time', location: 'Manchester, UK (Hybrid)',
    skills: ['kubernetes', 'terraform', 'aws', 'ci/cd', 'linux'], experienceYears: 4, salary: [65000, 85000, 'GBP'], deadlineDays: 33, postedDaysAgo: 8,
    description: describe({
      about: 'Keep the platform that tracks thousands of shipments a day fast and dependable.',
      doing: ['Run and improve our Kubernetes clusters on AWS', 'Manage infrastructure with Terraform', 'Build CI/CD pipelines and observability for product teams'],
      needs: ['4+ years in DevOps or SRE roles', 'Deep Kubernetes and Terraform experience', 'A calm approach to incidents and post-mortems'],
    }),
  },
  {
    key: 'C2', company: 'copperline', title: 'Customer Success Manager', jobType: 'full-time', location: 'Manchester, UK',
    skills: ['customer success', 'saas', 'communication', 'crm'], experienceYears: 3, salary: [40000, 52000, 'GBP'], deadlineDays: 20, postedDaysAgo: 5,
    description: describe({
      about: 'Be the trusted contact for our freight and warehouse customers.',
      doing: ['Onboard new customers and run regular check-ins', 'Spot risks early and coordinate fixes with engineering', 'Gather feedback that shapes our roadmap'],
      needs: ['3+ years in customer success or account management', 'Experience with SaaS products and a CRM', 'Empathy and clear communication'],
    }),
  },
  {
    key: 'C3', company: 'copperline', title: 'Junior Backend Developer', jobType: 'full-time', location: 'Manchester, UK (On-site)',
    skills: ['java', 'spring', 'sql', 'git'], experienceYears: 1, salary: [32000, 42000, 'GBP'], deadlineDays: 12, postedDaysAgo: 2,
    description: describe({
      about: 'A first-or-second role for a developer who wants real mentorship on a production Java codebase.',
      doing: ['Build and fix features in our Spring services', 'Write tests and review code with senior colleagues', 'Learn how logistics software works in practice'],
      needs: ['Up to 2 years of experience, or strong projects', 'Java and SQL fundamentals', 'Enthusiasm for learning'],
    }),
  },
  {
    key: 'C4', company: 'copperline', title: 'Operations Analyst Intern', jobType: 'internship', location: 'Manchester, UK',
    skills: ['excel', 'sql', 'analytics'], experienceYears: 0, salary: [20000, 24000, 'GBP'], deadlineDays: -10, postedDaysAgo: 38,
    description: describe({
      about: 'A summer internship supporting our operations team with data and reporting.',
      doing: ['Prepare weekly performance reports', 'Clean and analyse operational data with Excel and SQL', 'Help investigate delivery delays'],
      needs: ['Studying a numerate subject', 'Good Excel skills; basic SQL helpful', 'Attention to detail'],
    }),
  },
  {
    key: 'S1', company: 'skybridge', title: 'Senior Backend Engineer', jobType: 'full-time', location: 'Karachi, Pakistan',
    skills: ['node', 'typescript', 'postgresql', 'redis', 'microservices'], experienceYears: 5, salary: [45000, 65000, 'USD'], deadlineDays: 30, postedDaysAgo: 10,
    description: describe({
      about: 'Design and run the services that move money for thousands of small businesses.',
      doing: ['Own payment and ledger services end to end', 'Design for correctness, idempotency and scale', 'Take part in on-call and improve our reliability'],
      needs: ['5+ years of backend engineering', 'Node.js and TypeScript with PostgreSQL', 'Experience with financial or transactional systems is a plus'],
    }),
  },
  {
    key: 'S2', company: 'skybridge', title: 'Application Security Engineer', jobType: 'full-time', location: 'Karachi, Pakistan (Hybrid)',
    skills: ['appsec', 'owasp', 'penetration testing', 'python'], experienceYears: 4, salary: [40000, 58000, 'USD'], deadlineDays: 27, postedDaysAgo: 14,
    description: describe({
      about: 'Protect our platform and our customers by finding problems before attackers do.',
      doing: ['Review designs and code for security issues', 'Run penetration tests and track fixes to completion', 'Teach engineers secure coding practices'],
      needs: ['4+ years in application security', 'Strong knowledge of the OWASP Top 10', 'Scripting skills, ideally Python'],
    }),
  },
  {
    key: 'S3', company: 'skybridge', title: 'Frontend Developer', jobType: 'full-time', location: 'Lahore, Pakistan (Remote)',
    skills: ['react', 'javascript', 'tailwind css', 'rest apis'], experienceYears: 2, salary: [24000, 36000, 'USD'], deadlineDays: 22, postedDaysAgo: 6,
    description: describe({
      about: 'Build the merchant dashboard our customers use every day.',
      doing: ['Develop React features with Tailwind CSS', 'Integrate with our REST APIs', 'Write tests and fix bugs quickly'],
      needs: ['2+ years of React experience', 'Solid JavaScript and CSS', 'Good communication in English'],
    }),
  },
  {
    key: 'S4', company: 'skybridge', title: 'Digital Marketing Intern', jobType: 'internship', location: 'Karachi, Pakistan',
    skills: ['seo', 'content writing', 'social media', 'analytics'], experienceYears: 0, salary: [3000, 4800, 'USD'], deadlineDays: 9, postedDaysAgo: 1,
    description: describe({
      about: 'Learn how a fintech brand grows, from content to campaigns.',
      doing: ['Write blog posts and social content', 'Help run SEO improvements and track results', 'Support campaign reporting'],
      needs: ['Recent graduate or final-year student', 'Strong written English', 'Interest in marketing and analytics'],
    }),
  },
  {
    key: 'P1', company: 'pixelforge', title: 'Gameplay Programmer', jobType: 'full-time', location: 'Montreal, Canada',
    skills: ['c++', 'unity', 'c#', 'game design'], experienceYears: 3, salary: [85000, 110000, 'CAD'], deadlineDays: 38, postedDaysAgo: 13,
    description: describe({
      about: 'Bring characters, combat and puzzles to life in our next narrative adventure.',
      doing: ['Implement gameplay systems in Unity and C#', 'Prototype mechanics with designers', 'Profile and optimise for PC and console'],
      needs: ['3+ years of gameplay programming', 'C# with Unity; C++ is a plus', 'A shipped title or strong portfolio'],
    }),
  },
  {
    key: 'P2', company: 'pixelforge', title: '3D Environment Artist (Contract)', jobType: 'contract', location: 'Remote',
    skills: ['blender', 'substance painter', 'unreal engine'], experienceYears: 3, salary: [70000, 90000, 'CAD'], deadlineDays: 16, postedDaysAgo: 9,
    description: describe({
      about: 'Craft atmospheric environments for an upcoming release on a 9-month contract.',
      doing: ['Model and texture environment assets', 'Assemble scenes in Unreal Engine', 'Iterate with art direction'],
      needs: ['3+ years of environment art', 'Blender, Substance Painter and Unreal Engine', 'A portfolio of stylised or realistic scenes'],
    }),
  },
  {
    key: 'P3', company: 'pixelforge', title: 'UI/UX Designer', jobType: 'full-time', location: 'Montreal, Canada (Hybrid)',
    skills: ['figma', 'ui design', 'motion design', 'prototyping'], experienceYears: 3, salary: [75000, 95000, 'CAD'], deadlineDays: 29, postedDaysAgo: 5,
    description: describe({
      about: 'Design menus, HUDs and companion apps that feel as good as the game.',
      doing: ['Design interfaces and interaction flows in Figma', 'Prototype motion and transitions', 'Playtest with players and refine'],
      needs: ['3+ years of UI/UX design', 'Strong visual and motion design skills', 'Interest in games'],
    }),
  },
  {
    key: 'P4', company: 'pixelforge', title: 'Freelance Illustrator', jobType: 'freelance', location: 'Remote', status: 'closed',
    skills: ['illustration', 'photoshop', 'concept art'], experienceYears: 2, salary: [30000, 50000, 'CAD'], postedDaysAgo: 42,
    description: describe({
      about: 'This opening has been closed. We may reopen it next season.',
      doing: ['Create character and key art', 'Deliver assets to spec and on schedule', 'Take feedback from the art director'],
      needs: ['2+ years of professional illustration', 'Photoshop and digital painting skills', 'A strong portfolio'],
    }),
  },
];

const applications = [
  { candidate: 'amara', job: 'B1', status: 'shortlisted' },
  { candidate: 'amara', job: 'S3', status: 'interview' },
  { candidate: 'amara', job: 'P3', status: 'reviewed' },
  { candidate: 'amara', job: 'B3', status: 'pending' },
  { candidate: 'liam', job: 'B2', status: 'interview' },
  { candidate: 'liam', job: 'S1', status: 'pending' },
  { candidate: 'liam', job: 'C3', status: 'rejected' },
  { candidate: 'liam', job: 'L1', status: 'reviewed', plain: true },
  { candidate: 'sofia', job: 'B3', status: 'hired' },
  { candidate: 'sofia', job: 'B2', status: 'shortlisted' },
  { candidate: 'sofia', job: 'S3', status: 'pending' },
  { candidate: 'sofia', job: 'H1', status: 'withdrawn' },
  { candidate: 'daniel', job: 'L2', status: 'interview' },
  { candidate: 'daniel', job: 'L1', status: 'rejected' },
  { candidate: 'daniel', job: 'C2', status: 'reviewed' },
  { candidate: 'priya', job: 'L3', status: 'hired' },
  { candidate: 'priya', job: 'L1', status: 'shortlisted' },
  { candidate: 'omar', job: 'C1', status: 'shortlisted' },
  { candidate: 'omar', job: 'B2', status: 'pending' },
  { candidate: 'omar', job: 'S2', status: 'rejected', plain: true },
  { candidate: 'chloe', job: 'H3', status: 'interview' },
  { candidate: 'chloe', job: 'P3', status: 'hired' },
  { candidate: 'chloe', job: 'P2', status: 'pending' },
  { candidate: 'marcus', job: 'B4', status: 'rejected' },
  { candidate: 'marcus', job: 'C3', status: 'shortlisted' },
  { candidate: 'marcus', job: 'C2', status: 'pending', plain: true },
  { candidate: 'marcus', job: 'C4', status: 'withdrawn' },
  { candidate: 'hannah', job: 'H2', status: 'interview' },
  { candidate: 'hannah', job: 'C2', status: 'rejected' },
  { candidate: 'zain', job: 'S4', status: 'pending' },
  { candidate: 'zain', job: 'S3', status: 'reviewed' },
  { candidate: 'zain', job: 'L4', status: 'reviewed' },
];

module.exports = { DEMO_EMAIL_DOMAIN, companies, candidates, jobs, applications, describe, logo };
