export const profile = {
  // Identity
  name:            'Lau Wei Xiang',
  username:        'weixiang',
  promptHost:      'portfolio',

  // Contact
  email:           'weixiang0124@gmail.com',
  github:          'https://github.com/w3ixi4ng',
  githubDisplay:   'github.com/w3ixi4ng',
  linkedin:        'https://linkedin.com/in/lau-wei-xiang',
  linkedinDisplay: 'linkedin.com/in/lau-wei-xiang',
  phone:           '+65 8533 6236',

  // Education
  university:    'Singapore Management University',
  degree:        'B.Sc. Information Systems (Aug 2024 – Apr 2028)',
  degreeShort:   'B.Sc. Information Systems',
  gpa:           '4.0/4.0',
  gpaLabel:      'GPA 4.0/4.0',
  honors:        'Summa Cum Laude · Highest Distinction',
  scholarship:   "SMU Merit Scholarship · SCIS Dean's List AY 2024/2025",

  // Bio
  bio: 'Full-stack developer with experience in microservices and cloud deployment. Currently studying at SMU while building real-world systems.',

  // Quick-glance tags shown on the banner
  roles: ['Software Engineer'],
  bannerTag: 'SMU Information Systems · GPA 4.0/4.0 (Summa Cum Laude)',

  // Neofetch summary lines
  stack: 'Python · React · Docker · K8s',
  cloud: 'AWS · GCP · Azure',
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  name:    string
  role:    string
  period:  string
  stack:   string[]
  bullets: string[]
}

export const projects: Project[] = [
  {
    name:   'Bidly',
    role:   'Project Lead',
    period: 'Jan 2026 – May 2026',
    stack:  ['FastAPI', 'RabbitMQ', 'WebSocket', 'Docker', 'Kubernetes', 'Stripe', 'Twilio'],
    bullets: [
      'Microservices with FastAPI — independent scaling per service',
      'RabbitMQ async task processing decouples services under peak load',
      'WebSocket service pushes live bid updates to frontend',
      'Kubernetes orchestration — self-healing, load-balanced across nodes',
      'Stripe + Twilio for secure payments and SMS notifications',
    ],
  },
  {
    name:   'SMUXchange',
    role:   'Project Lead',
    period: 'Aug – Dec 2025',
    stack:  ['React.js', 'Node.js', 'Firebase', 'Tailwind CSS', 'Shadcn UI'],
    bullets: [
      'Exchange program discovery app for SMU students',
      'Reduced planning time by 50% for users',
      'Responsive frontend with React, Tailwind CSS, and Shadcn UI',
      'Firebase for database operations and user authentication',
    ],
  },
]

// ─── Experience ───────────────────────────────────────────────────────────────

export interface Experience {
  company: string
  role:    string
  period:  string
  bullets: string[]
}

export const experience: Experience[] = [
  {
    company: 'GovTech',
    role:    'Software Engineer Intern',
    period:  'May 2026 – Present',
    bullets: [
      'Kubernetes-based deployment pipelines for government services',
      'OpenBao for secrets management — centralised vault for credentials and API keys',
      'SPIFFE/SPIRE for workload identity — zero-trust service-to-service authentication',
    ],
  },
  {
    company: 'PCA Company Services',
    role:    'Automation Engineer Intern',
    period:  'Dec 2025 – Jan 2026',
    bullets: [
      'Full-stack booking system (FastAPI + React) → 40% faster processing',
      'Content automation pipeline (Python + Gemini + Apps Script → WordPress) → 80% less manual work',
      'Payroll report desktop app → 80% less manual reporting effort',
      'Containerised deployments with Docker on Google Cloud Run',
    ],
  },
  {
    company: 'Singapore Management University',
    role:    'Teaching Assistant',
    period:  'Jun 2025 – Dec 2025',
    bullets: [
      'Python participation tracking script → 75% less admin overhead',
      'Guided 40+ students deploying virtual servers on AWS EC2',
    ],
  },
]

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skills = {
  languages:  ['Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'HTML', 'CSS', 'SQL'],
  frameworks: ['FastAPI', 'Flask', 'React.js', 'Vue.js', 'Node.js', 'Tailwind CSS', 'Bootstrap', 'Pandas'],
  tools:      ['Docker', 'Kubernetes', 'RabbitMQ', 'Git'],
  cloud:      ['AWS', 'Azure', 'Firebase', 'Vercel', 'Google Cloud'],
}
