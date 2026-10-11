import { Career, Skill, UserProfile, ResumeProfile, CareerRoadmap } from '../types';

export const INITIAL_CAREERS: Career[] = [
  {
    id: 'software-developer',
    title: 'Software Developer',
    category: 'Software Engineering',
    experienceLevel: 'Entry-Level',
    shortDescription: 'Build, test, and maintain computer software applications and core algorithmic services.',
    fullDescription: 'Software developers design, write, test, and maintain code for computer applications and systems. They turn business requirements into clean, scalable architecture, conduct code reviews, collaborate using Git, and debug production workloads.',
    medianSalaryRange: '$85,000 – $130,000',
    projectedGrowth: '+17% (Faster than average)',
    typicalResponsibilities: [
      'Write clean, modular, and maintainable application code in modern programming languages.',
      'Design RESTful and GraphQL APIs to power frontend and mobile client applications.',
      'Collaborate in agile sprints, participating in daily stand-ups and code reviews.',
      'Write unit, integration, and end-to-end tests to guarantee system reliability.',
      'Debug production bottlenecks and troubleshoot algorithmic performance issues.'
    ],
    requiredSkills: [
      { skillId: 'javascript', name: 'JavaScript / TypeScript', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'python', name: 'Python', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'git', name: 'Git & Version Control', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'dsa', name: 'Data Structures & Algorithms', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'sql', name: 'SQL & Relational Databases', level: 'Intermediate', importance: 'Important' },
      { skillId: 'rest-api', name: 'RESTful API Design', level: 'Intermediate', importance: 'Important' },
      { skillId: 'docker', name: 'Docker & Containerization', level: 'Beginner', importance: 'Nice-to-Have' }
    ],
    toolsAndTechnologies: ['Git', 'GitHub', 'VS Code', 'Postman', 'Docker', 'Linux CLI', 'Jest'],
    educationRequirements: [
      "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical coding bootcamp experience",
      'Demonstrated portfolio of completed full-stack software applications'
    ],
    possibleEntryRoutes: [
      'Junior Developer or Associate Software Engineer apprenticeship',
      'Open-source software contributor and project builder',
      'Computer Science university graduate or accredited bootcamp graduate'
    ],
    relatedCareerIds: ['full-stack-developer', 'cloud-engineer', 'devops-engineer']
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    experienceLevel: 'Entry-Level',
    shortDescription: 'Inspect, cleanse, and model data to discover useful insights and inform strategic business decisions.',
    fullDescription: 'Data Analysts bridge the gap between technical datasets and executive business decisions. They transform raw, unorganized data into intuitive business dashboards, statistical summaries, and actionable recommendations.',
    medianSalaryRange: '$72,000 – $105,000',
    projectedGrowth: '+23% (Much faster than average)',
    typicalResponsibilities: [
      'Extract, clean, and validate data from SQL databases and diverse APIs.',
      'Create executive KPI dashboards using tools like Tableau, Power BI, or Looker.',
      'Perform exploratory data analysis (EDA) using Python or R.',
      'Translate complex metrics into clear executive presentations and actionable insights.',
      'Formulate A/B testing hypotheses and evaluate business experiment metrics.'
    ],
    requiredSkills: [
      { skillId: 'sql', name: 'SQL & Database Querying', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'excel', name: 'Advanced Excel & Spreadsheets', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'bi-tools', name: 'Business Intelligence (Power BI / Tableau)', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'python-data', name: 'Python for Data Analysis (Pandas, NumPy)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'statistics', name: 'Applied Statistics & Probability', level: 'Intermediate', importance: 'Important' },
      { skillId: 'storytelling', name: 'Data Storytelling & Presentation', level: 'Intermediate', importance: 'Important' }
    ],
    toolsAndTechnologies: ['SQL Server', 'PostgreSQL', 'Tableau', 'Power BI', 'Excel', 'Pandas', 'Jupyter Notebooks'],
    educationRequirements: [
      "Bachelor's degree in Mathematics, Statistics, Economics, Information Systems, or Computer Science",
      'Alternative path: Verified data analytics certifications with strong portfolio case studies'
    ],
    possibleEntryRoutes: [
      'Junior Business Analyst or Operations Analyst',
      'Marketing or Financial Data Analyst',
      'Self-taught analyst with portfolio case studies on public datasets (Kaggle/data.gov)'
    ],
    relatedCareerIds: ['data-scientist', 'product-manager']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & AI',
    experienceLevel: 'Mid-Level',
    shortDescription: 'Combine advanced statistics, machine learning algorithms, and domain expertise to solve complex problems.',
    fullDescription: 'Data scientists build predictive models, design experiment frameworks, and deploy machine learning pipelines. They uncover hidden patterns in massive multi-dimensional datasets to automate decision-making.',
    medianSalaryRange: '$110,000 – $165,000',
    projectedGrowth: '+35% (Much faster than average)',
    typicalResponsibilities: [
      'Design, train, validate, and tune statistical and machine learning models.',
      'Conduct feature engineering and data preprocessing on structured and unstructured datasets.',
      'Formulate mathematical formulations for optimization and business forecasting.',
      'Collaborate with machine learning engineers to deploy predictive models to production APIs.',
      'Design robust experiments and interpret causal inference results.'
    ],
    requiredSkills: [
      { skillId: 'python', name: 'Python (Scikit-Learn, Pandas, NumPy)', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'statistics', name: 'Advanced Statistics & Probability', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'machine-learning', name: 'Machine Learning Algorithms', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'sql', name: 'SQL & Data Warehousing', level: 'Intermediate', importance: 'Important' },
      { skillId: 'deep-learning', name: 'Deep Learning (PyTorch / TensorFlow)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'big-data', name: 'Big Data Processing (Spark)', level: 'Beginner', importance: 'Nice-to-Have' }
    ],
    toolsAndTechnologies: ['Python', 'PyTorch', 'Scikit-learn', 'SQL', 'JupyterLab', 'MLflow', 'Docker'],
    educationRequirements: [
      "Master's or Bachelor's degree in Data Science, Computer Science, Statistics, or Quantitative Field",
      'Published research or verified machine learning competition results (e.g. Kaggle)'
    ],
    possibleEntryRoutes: [
      'Transition from Data Analyst or Quantitative Analyst',
      'Academic research transition in computational sciences',
      'Junior Data Scientist following specialized postgraduate program'
    ],
    relatedCareerIds: ['data-analyst', 'ai-ml-engineer']
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Design & Product',
    experienceLevel: 'Entry-Level',
    shortDescription: 'Create intuitive, accessible, and engaging digital experiences through user research and visual craft.',
    fullDescription: 'UI/UX Designers conduct user research, synthesize behavioral insights, build wireframes and interactive prototypes, and design polished, accessible interfaces following modern design systems.',
    medianSalaryRange: '$78,000 – $120,000',
    projectedGrowth: '+16% (Faster than average)',
    typicalResponsibilities: [
      'Conduct user interviews, usability audits, and competitive benchmarking.',
      'Create journey maps, information architecture, user flows, and wireframes.',
      'Build responsive UI mockups and design token systems in Figma.',
      'Ensure strict WCAG 2.2 AA accessibility standards across all interactive states.',
      'Collaborate closely with frontend developers for pixel-perfect implementation.'
    ],
    requiredSkills: [
      { skillId: 'figma', name: 'Figma & Design Systems', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'user-research', name: 'User Research & Usability Testing', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'wireframing', name: 'Wireframing & Prototyping', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'accessibility', name: 'Accessibility (WCAG 2.2)', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'visual-design', name: 'Visual Hierarchy & Typography', level: 'Intermediate', importance: 'Important' },
      { skillId: 'html-css', name: 'HTML & CSS Fundamentals', level: 'Beginner', importance: 'Important' }
    ],
    toolsAndTechnologies: ['Figma', 'FigJam', 'Miro', 'Adobe Creative Suite', 'Maze', 'Notion', 'Storybook'],
    educationRequirements: [
      "Degree in Human-Computer Interaction (HCI), Interaction Design, Graphic Design, or equivalent portfolio",
      'A comprehensive case-study portfolio showcasing end-to-end design thinking'
    ],
    possibleEntryRoutes: [
      'Junior Product Designer at a design agency or tech startup',
      'Freelance UI designer with published case studies',
      'Graphic designer or frontend developer pivoting to product design'
    ],
    relatedCareerIds: ['product-manager', 'software-developer']
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Security & Operations',
    experienceLevel: 'Entry-Level',
    shortDescription: 'Protect organizational computer networks, servers, and sensitive data from cyber threats and intrusions.',
    fullDescription: 'Cybersecurity Analysts monitor security telemetry, analyze vulnerabilities, remediate incidents, and configure network defense tools like firewalls and SIEM platforms to safeguard infrastructure.',
    medianSalaryRange: '$88,000 – $135,000',
    projectedGrowth: '+32% (Much faster than average)',
    typicalResponsibilities: [
      'Monitor Security Information and Event Management (SIEM) consoles for suspicious activity.',
      'Investigate security breaches, document incidents, and execute containment procedures.',
      'Perform vulnerability assessments, penetration tests, and security patch audits.',
      'Configure firewalls, endpoint detection, and identity access control policies.',
      'Educate internal teams on phishing avoidance and security hygiene.'
    ],
    requiredSkills: [
      { skillId: 'networking', name: 'Computer Networking (TCP/IP, DNS, OSI)', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'security-fundamentals', name: 'Security Fundamentals & SIEM', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'linux-security', name: 'Linux System Administration & Shell', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'incident-response', name: 'Incident Response & Threat Analysis', level: 'Intermediate', importance: 'Important' },
      { skillId: 'cryptography', name: 'Applied Cryptography & PKI', level: 'Intermediate', importance: 'Important' },
      { skillId: 'python-security', name: 'Python Scripting for Security', level: 'Beginner', importance: 'Nice-to-Have' }
    ],
    toolsAndTechnologies: ['Wireshark', 'Splunk', 'Nmap', 'Burp Suite', 'Metasploit', 'Linux', 'Snort'],
    educationRequirements: [
      "Bachelor's degree in Cybersecurity, Information Assurance, Computer Science, or equivalent",
      'Industry certifications such as CompTIA Security+, Network+, or CEH'
    ],
    possibleEntryRoutes: [
      'Security Operations Center (SOC) Tier 1 Analyst',
      'Network Administrator or Systems Support transition',
      'Military/government defense cyber specialist transition'
    ],
    relatedCareerIds: ['cloud-engineer', 'devops-engineer']
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Cloud & Infrastructure',
    experienceLevel: 'Mid-Level',
    shortDescription: 'Design, deploy, and maintain scalable cloud architecture across AWS, GCP, or Microsoft Azure.',
    fullDescription: 'Cloud Engineers build secure, fault-tolerant infrastructure in the cloud. They manage virtual networks, implement Infrastructure as Code (Terraform), optimize cloud spending, and ensure continuous service uptime.',
    medianSalaryRange: '$105,000 – $155,000',
    projectedGrowth: '+25% (Much faster than average)',
    typicalResponsibilities: [
      'Provision and manage cloud environments using Infrastructure as Code (Terraform, CloudFormation).',
      'Design high-availability cloud networking (VPCs, subnets, load balancers, gateways).',
      'Configure Identity and Access Management (IAM) role policies following least privilege.',
      'Automate backup, failover, disaster recovery, and cost-optimization routines.',
      'Migrate legacy on-premises applications to containerized cloud architectures.'
    ],
    requiredSkills: [
      { skillId: 'cloud-platforms', name: 'Cloud Provider Services (AWS / GCP / Azure)', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'terraform', name: 'Infrastructure as Code (Terraform)', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'linux', name: 'Linux OS & Shell Scripting', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'networking', name: 'Cloud Networking & DNS', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'docker', name: 'Containerization (Docker & Kubernetes)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'ci-cd', name: 'CI/CD Pipelines (GitHub Actions / GitLab)', level: 'Intermediate', importance: 'Important' }
    ],
    toolsAndTechnologies: ['AWS', 'Google Cloud', 'Terraform', 'Docker', 'Kubernetes', 'Bash', 'GitHub Actions'],
    educationRequirements: [
      "Degree in Computer Science, Computer Engineering, or related technical field",
      'Cloud associate or professional certification (AWS Solutions Architect, GCP Cloud Engineer)'
    ],
    possibleEntryRoutes: [
      'Systems Administrator or DevOps technician stepping into cloud infrastructure',
      'Backend software developer focused on infrastructure',
      'Certified cloud practitioner with practical lab portfolio'
    ],
    relatedCareerIds: ['devops-engineer', 'cybersecurity-analyst', 'software-developer']
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI / ML Engineer',
    category: 'Data & AI',
    experienceLevel: 'Mid-Level',
    shortDescription: 'Build, deploy, and scale artificial intelligence models and large language model systems in production.',
    fullDescription: 'AI and Machine Learning Engineers take research models and turn them into scalable, production-grade applications. They design model serving architectures, fine-tune foundation models, build retrieval-augmented generation (RAG) pipelines, and monitor model performance.',
    medianSalaryRange: '$125,000 – $185,000',
    projectedGrowth: '+40% (Explosive industry demand)',
    typicalResponsibilities: [
      'Build end-to-end machine learning and generative AI workflows in Python and cloud services.',
      'Deploy models as resilient microservices with low latency inference endpoints.',
      'Implement RAG (Retrieval-Augmented Generation) architectures using vector databases.',
      'Fine-tune foundation models using LoRA / PEFT techniques.',
      'Monitor model drift, hallucination metrics, and operational compute costs.'
    ],
    requiredSkills: [
      { skillId: 'python', name: 'Advanced Python & Async Architecture', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'deep-learning', name: 'Deep Learning (PyTorch, Hugging Face)', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'llm-engineering', name: 'LLM APIs, Prompting & RAG Pipelines', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'model-serving', name: 'Model Serving & Optimization (Triton, ONNX)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'vector-dbs', name: 'Vector Databases (Pinecone, Chroma, PGvector)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'docker', name: 'Docker & GPU Containerization', level: 'Intermediate', importance: 'Important' }
    ],
    toolsAndTechnologies: ['PyTorch', 'Hugging Face', 'LangChain/LlamaIndex', 'vLLM', 'Docker', 'FastAPI', 'ChromaDB'],
    educationRequirements: [
      "Bachelor's or Master's degree in Computer Science, Machine Learning, Artificial Intelligence, or Electrical Engineering",
      'Proven open-source portfolio or published models/implementations on Hugging Face'
    ],
    possibleEntryRoutes: [
      'Software engineer pivoting to ML/AI engineering',
      'Data scientist transitioning to production software systems',
      'Master/PhD graduate with hands-on deep learning projects'
    ],
    relatedCareerIds: ['data-scientist', 'software-developer', 'cloud-engineer']
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Cloud & Infrastructure',
    experienceLevel: 'Mid-Level',
    shortDescription: 'Unify software development and IT operations through automated delivery pipelines and observability.',
    fullDescription: 'DevOps Engineers build high-velocity CI/CD pipelines, automate infrastructure deployments, manage Kubernetes clusters, and establish 24/7 observability and site reliability standards.',
    medianSalaryRange: '$110,000 – $160,000',
    projectedGrowth: '+22% (Faster than average)',
    typicalResponsibilities: [
      'Construct automated CI/CD deployment pipelines using GitHub Actions or GitLab CI.',
      'Orchestrate microservice containers with Kubernetes and Helm charts.',
      'Implement continuous monitoring, alerting, and distributed tracing (Prometheus, Grafana).',
      'Implement zero-downtime deployment strategies (blue/green, canary).',
      'Foster collaboration between development and operations teams.'
    ],
    requiredSkills: [
      { skillId: 'ci-cd', name: 'CI/CD Pipeline Automation', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'docker', name: 'Docker & Container Runtimes', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'kubernetes', name: 'Kubernetes Cluster Management', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'linux', name: 'Linux Systems & Shell Scripting', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'observability', name: 'Monitoring & Observability (Prometheus, Grafana)', level: 'Intermediate', importance: 'Important' },
      { skillId: 'terraform', name: 'Infrastructure as Code (Terraform)', level: 'Intermediate', importance: 'Important' }
    ],
    toolsAndTechnologies: ['Kubernetes', 'Docker', 'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana', 'Helm'],
    educationRequirements: [
      "Degree in Computer Science or extensive practical systems engineering experience"
    ],
    possibleEntryRoutes: [
      'System Administrator transitioning to automation',
      'Backend Developer transitioning to platform and infrastructure'
    ],
    relatedCareerIds: ['cloud-engineer', 'software-developer']
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    experienceLevel: 'Entry-Level',
    shortDescription: 'Build end-to-end web applications across user-facing client interfaces and backend databases.',
    fullDescription: 'Full Stack Developers bridge frontend user interfaces with backend servers and databases. They build dynamic React applications, design SQL/NoSQL databases, construct secure REST/GraphQL APIs, and deploy cloud apps.',
    medianSalaryRange: '$90,000 – $140,000',
    projectedGrowth: '+18% (Faster than average)',
    typicalResponsibilities: [
      'Develop responsive user interfaces using React, TypeScript, and modern styling.',
      'Architect backend services, authentication mechanisms, and REST/GraphQL APIs.',
      'Design relational and document database schemas with migrations and indexing.',
      'Integrate third-party APIs, webhooks, and asynchronous job queues.',
      'Deploy and maintain containerized applications on cloud hosting platforms.'
    ],
    requiredSkills: [
      { skillId: 'javascript', name: 'JavaScript & TypeScript', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'react', name: 'React & Component Architecture', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'nodejs', name: 'Node.js & Express / Backend Frameworks', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'sql', name: 'SQL & Database Design', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'git', name: 'Git & Version Control', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'html-css', name: 'HTML5, CSS3 & Responsive Design', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'docker', name: 'Docker & Basic Cloud Deployment', level: 'Beginner', importance: 'Nice-to-Have' }
    ],
    toolsAndTechnologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git', 'Vite'],
    educationRequirements: [
      "Bachelor's degree in Computer Science, Software Engineering or accredited web development training",
      'Comprehensive portfolio featuring at least two fully functional full-stack applications'
    ],
    possibleEntryRoutes: [
      'Frontend developer expanding to backend',
      'Bootcamp or computer science graduate with full-stack capstone projects'
    ],
    relatedCareerIds: ['software-developer', 'ui-ux-designer', 'cloud-engineer']
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'Design & Product',
    experienceLevel: 'Mid-Level',
    shortDescription: 'Define product vision, prioritize roadmap features, and align cross-functional engineering teams.',
    fullDescription: 'Product Managers guide products through their entire lifecycle. They identify customer pain points, conduct market discovery, write detailed product specs, and prioritize feature roadmaps to maximize user value and business revenue.',
    medianSalaryRange: '$100,000 – $150,000',
    projectedGrowth: '+15% (Faster than average)',
    typicalResponsibilities: [
      'Conduct customer interviews and extract quantitative telemetry insights.',
      'Define product requirements, user stories, and acceptance criteria in Jira/Linear.',
      'Build and communicate product roadmaps to stakeholders and executive leadership.',
      'Prioritize product backlog based on customer impact, technical debt, and revenue.',
      'Lead sprint planning and sprint reviews with engineering and design teams.'
    ],
    requiredSkills: [
      { skillId: 'product-strategy', name: 'Product Strategy & Roadmapping', level: 'Advanced', importance: 'Must-Have' },
      { skillId: 'user-research', name: 'User Research & Problem Discovery', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'data-analytics', name: 'Data Analytics & Metric Tracking', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'agile-scrum', name: 'Agile & Scrum Methodologies', level: 'Intermediate', importance: 'Must-Have' },
      { skillId: 'tech-literacy', name: 'Technical Literacy for PMs', level: 'Intermediate', importance: 'Important' },
      { skillId: 'stakeholder-mgmt', name: 'Stakeholder Management & Communication', level: 'Advanced', importance: 'Must-Have' }
    ],
    toolsAndTechnologies: ['Jira', 'Linear', 'Notion', 'Figma', 'Mixpanel', 'Amplitude', 'Google Analytics'],
    educationRequirements: [
      "Degree in Business, Computer Science, Engineering, or relevant industry experience",
      'Demonstrated track record of taking software features from conception to launch'
    ],
    possibleEntryRoutes: [
      'Associate Product Manager (APM) rotational program',
      'Transition from Software Engineering, Data Analysis, or UX Design'
    ],
    relatedCareerIds: ['ui-ux-designer', 'data-analyst']
  }
];

export const INITIAL_SKILLS: Skill[] = [
  {
    id: 'javascript',
    name: 'JavaScript / TypeScript',
    category: 'Programming Languages',
    proficiency: 'Intermediate',
    description: 'The core programming languages of the modern web, powering dynamic browser clients and asynchronous server backends.',
    relevance: 'Essential for frontend, backend, full stack, and cloud software engineering.',
    prerequisites: ['Basic Computer Literacy', 'Basic Logic & Problem Solving'],
    learningResources: [
      { title: 'The Modern JavaScript Tutorial (javascript.info)', type: 'Documentation', provider: 'javascript.info', url: 'https://javascript.info', free: true },
      { title: 'TypeScript Handbook Official Documentation', type: 'Documentation', provider: 'TypeScript Official', url: 'https://www.typescriptlang.org/docs/', free: true },
      { title: 'Full Stack Open — Deep Dive into Modern Web Development', type: 'Course', provider: 'University of Helsinki', url: 'https://fullstackopen.com/en/', free: true }
    ],
    practiceTasks: [
      'Refactor a JavaScript object-oriented script into strictly typed TypeScript interfaces.',
      'Write an asynchronous data fetcher with comprehensive try/catch and abort controller handling.',
      'Implement custom array functions (map, filter, reduce) from scratch.'
    ],
    suggestedProjects: [
      { title: 'Interactive Task & Workflow Manager', difficulty: 'Beginner', description: 'Build a drag-and-drop task organizer with local storage persistence and strict TypeScript typings.' },
      { title: 'Real-time Currency & Crypto Converter', difficulty: 'Intermediate', description: 'Connect to external financial APIs, handle exchange calculations, and display historic charts.' }
    ],
    isSaved: true,
    acquiredDate: '2024-01-15',
    practiceHours: 56,
    practiceCount: 28,
    proficiencyHistory: [
      { date: 'Month 1', score: 32, hours: 8 },
      { date: 'Month 2', score: 45, hours: 18 },
      { date: 'Month 3', score: 58, hours: 28 },
      { date: 'Month 4', score: 68, hours: 38 },
      { date: 'Month 5', score: 78, hours: 46 },
      { date: 'Month 6', score: 86, hours: 56 }
    ]
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Programming Languages',
    proficiency: 'Beginner',
    description: 'A versatile, high-level language revered for its readable syntax and dominant ecosystem in data science, AI, and automation.',
    relevance: 'Foundational for AI/ML engineering, data analysis, scientific research, and backend APIs.',
    prerequisites: ['Basic Computing Logic'],
    learningResources: [
      { title: 'Python Official Documentation & Tutorial', type: 'Documentation', provider: 'Python Software Foundation', url: 'https://docs.python.org/3/tutorial/', free: true },
      { title: 'Automate the Boring Stuff with Python', type: 'Book', provider: 'Al Sweigart', url: 'https://automatetheboringstuff.com', free: true },
      { title: 'Python for Everybody Specialization', type: 'Course', provider: 'Coursera / Dr. Chuck', url: 'https://www.py4e.com', free: true }
    ],
    practiceTasks: [
      'Write a script to parse, clean, and deduplicate CSV files using standard libraries.',
      'Build a command-line interface (CLI) tool using argparse or Click.',
      'Create an object-oriented simulation modeling bank accounts with transaction histories.'
    ],
    suggestedProjects: [
      { title: 'Automated Web Content Scraper', difficulty: 'Beginner', description: 'Scrape job listings or tech news articles into structured JSON files with rate limiting.' },
      { title: 'REST API Microservice with FastAPI', difficulty: 'Intermediate', description: 'Build an asynchronous API with Pydantic validation and automatic OpenAPI documentation.' }
    ],
    isSaved: true,
    acquiredDate: '2024-03-20',
    practiceHours: 38,
    practiceCount: 19,
    proficiencyHistory: [
      { date: 'Month 1', score: 25, hours: 6 },
      { date: 'Month 2', score: 35, hours: 12 },
      { date: 'Month 3', score: 46, hours: 19 },
      { date: 'Month 4', score: 55, hours: 26 },
      { date: 'Month 5', score: 64, hours: 32 },
      { date: 'Month 6', score: 72, hours: 38 }
    ]
  },
  {
    id: 'sql',
    name: 'SQL & Relational Databases',
    category: 'Backend',
    proficiency: 'Intermediate',
    description: 'Structured Query Language used to store, query, join, and optimize data in relational database management systems.',
    relevance: 'Required across data analytics, software development, cloud computing, and business operations.',
    prerequisites: ['Basic Understanding of Tables and Data'],
    learningResources: [
      { title: 'SQLBolt — Interactive Lessons', type: 'Interactive', provider: 'SQLBolt', url: 'https://sqlbolt.com', free: true },
      { title: 'PostgreSQL Official Documentation', type: 'Documentation', provider: 'PostgreSQL Global Group', url: 'https://www.postgresql.org/docs/', free: true },
      { title: 'Mode Analytics SQL Tutorial for Data Analysis', type: 'Course', provider: 'Mode Analytics', url: 'https://mode.com/sql-tutorial/', free: true }
    ],
    practiceTasks: [
      'Write multi-table INNER, LEFT, and FULL OUTER joins with conditional aggregations.',
      'Write advanced window functions (ROW_NUMBER(), RANK(), LAG(), LEAD()) for running totals.',
      'Analyze query execution plans with EXPLAIN ANALYZE and add optimal B-tree indexes.'
    ],
    suggestedProjects: [
      { title: 'E-Commerce Database Schema Design', difficulty: 'Intermediate', description: 'Design 3NF relational schemas for users, orders, products, and inventory with foreign key cascades.' },
      { title: 'Executive Sales Performance Analytics Suite', difficulty: 'Intermediate', description: 'Write SQL queries to report month-over-month customer retention cohorts and lifetime values.' }
    ],
    isSaved: true,
    acquiredDate: '2024-02-10',
    practiceHours: 28,
    practiceCount: 14,
    proficiencyHistory: [
      { date: 'Month 1', score: 28, hours: 4 },
      { date: 'Month 2', score: 40, hours: 9 },
      { date: 'Month 3', score: 50, hours: 15 },
      { date: 'Month 4', score: 58, hours: 20 },
      { date: 'Month 5', score: 64, hours: 24 },
      { date: 'Month 6', score: 68, hours: 28 }
    ]
  },
  {
    id: 'git',
    name: 'Git & Version Control',
    category: 'Tools & Frameworks',
    proficiency: 'Intermediate',
    description: 'Distributed version control system to track changes, manage collaborative branches, and deploy code securely.',
    relevance: 'Universal requirement for all modern software engineering and technical roles.',
    prerequisites: ['Basic Command Line Interface'],
    learningResources: [
      { title: 'Pro Git Book (Official Free Edition)', type: 'Book', provider: 'Git-SCM', url: 'https://git-scm.com/book/en/v2', free: true },
      { title: 'Learn Git Branching (Interactive Visualizer)', type: 'Interactive', provider: 'PCottle', url: 'https://learngitbranching.js.org', free: true }
    ],
    practiceTasks: [
      'Resolve complex multi-file merge conflicts on a Git branch.',
      'Perform an interactive rebase (`git rebase -i`) to squash commits and reword histories.',
      'Use `git bisect` to pinpoint the exact commit that introduced a software defect.'
    ],
    suggestedProjects: [
      { title: 'Multi-Contributor Open Source Simulation', difficulty: 'Beginner', description: 'Create a GitHub repository with branch protection, PR templates, and GitHub Actions CI checks.' }
    ],
    isSaved: true,
    acquiredDate: '2024-01-05',
    practiceHours: 20,
    practiceCount: 10,
    proficiencyHistory: [
      { date: 'Month 1', score: 35, hours: 3 },
      { date: 'Month 2', score: 46, hours: 7 },
      { date: 'Month 3', score: 56, hours: 11 },
      { date: 'Month 4', score: 63, hours: 14 },
      { date: 'Month 5', score: 70, hours: 17 },
      { date: 'Month 6', score: 75, hours: 20 }
    ]
  },
  {
    id: 'react',
    name: 'React & Component Architecture',
    category: 'Frontend',
    proficiency: 'Intermediate',
    description: 'Declarative component-driven UI library for web development with state management and hook primitives.',
    relevance: 'Industry standard for modern interactive user interfaces and web applications.',
    prerequisites: ['JavaScript / TypeScript', 'HTML & CSS Fundamentals'],
    learningResources: [
      { title: 'React Official Documentation (react.dev)', type: 'Documentation', provider: 'Meta Open Source', url: 'https://react.dev', free: true },
      { title: 'Epic React Guidelines & Patterns', type: 'Course', provider: 'Kent C. Dodds', url: 'https://epicreact.dev', free: false }
    ],
    practiceTasks: [
      'Build custom hooks for data fetching, debounce, and window dimensions.',
      'Optimize component renders using React.memo, useMemo, and useCallback where measured.',
      'Create accessible composite UI patterns using ARIA keyboard controls.'
    ],
    suggestedProjects: [
      { title: 'CareerPilot AI Dashboard UI', difficulty: 'Intermediate', description: 'Develop an accessible multi-view career guidance platform with local persistence.' }
    ],
    isSaved: true,
    acquiredDate: '2024-02-25',
    practiceHours: 44,
    practiceCount: 22,
    proficiencyHistory: [
      { date: 'Month 1', score: 20, hours: 6 },
      { date: 'Month 2', score: 36, hours: 14 },
      { date: 'Month 3', score: 50, hours: 22 },
      { date: 'Month 4', score: 64, hours: 30 },
      { date: 'Month 5', score: 74, hours: 38 },
      { date: 'Month 6', score: 82, hours: 44 }
    ]
  },
  {
    id: 'docker',
    name: 'Docker & Containerization',
    category: 'Cloud & DevOps',
    proficiency: 'Beginner',
    description: 'Standard platform to package software applications and dependencies into reproducible lightweight containers.',
    relevance: 'Essential for microservices, cloud deployments, and consistent developer environments.',
    prerequisites: ['Linux Basics', 'Command Line Fundamentals'],
    learningResources: [
      { title: 'Docker Official Get Started Documentation', type: 'Documentation', provider: 'Docker Inc.', url: 'https://docs.docker.com/get-started/', free: true },
      { title: 'Docker for Beginners Tutorial', type: 'Video', provider: 'freeCodeCamp', url: 'https://freecodecamp.org', free: true }
    ],
    practiceTasks: [
      'Write a multi-stage Dockerfile to minimize production image footprint.',
      'Write a docker-compose.yml file orchestrating a web app, redis cache, and postgres db.',
      'Inspect running container logs, process metrics, and volume mount configurations.'
    ],
    suggestedProjects: [
      { title: 'Containerized Full Stack Application', difficulty: 'Intermediate', description: 'Package a React frontend and Express/Postgres backend into a single orchestrated compose environment.' }
    ],
    isSaved: false
  },
  {
    id: 'figma',
    name: 'Figma & Design Systems',
    category: 'Design',
    proficiency: 'Beginner',
    description: 'Collaborative cloud interface design and prototyping tool with auto-layout and design token architectures.',
    relevance: 'Core tool for UI/UX designers, product managers, and design-minded frontend developers.',
    prerequisites: ['Basic Design Sensibility'],
    learningResources: [
      { title: 'Figma Learn Official Tutorials', type: 'Documentation', provider: 'Figma Inc.', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design', free: true }
    ],
    practiceTasks: [
      'Build a component library with auto-layout, variants, and component properties.',
      'Build an interactive prototype with smart animate transitions and scroll behaviors.'
    ],
    suggestedProjects: [
      { title: 'Mobile Banking App High-Fidelity Prototype', difficulty: 'Intermediate', description: 'Design a 10-screen mobile banking experience with light and dark mode design systems.' }
    ],
    isSaved: false
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Programming Languages',
    proficiency: 'Beginner',
    description: 'Foundational algorithmic techniques: arrays, trees, graphs, sorting, searching, recursion, and dynamic programming.',
    relevance: 'Critical for technical interviews, software engineering fundamentals, and high-efficiency systems.',
    prerequisites: ['Programming language proficiency (Python, JS, C++, or Java)'],
    learningResources: [
      { title: 'NeetCode Roadmap & Video Guides', type: 'Interactive', provider: 'NeetCode', url: 'https://neetcode.io', free: true },
      { title: 'Algorithms by Robert Sedgewick', type: 'Book', provider: 'Princeton University', url: 'https://algs4.cs.princeton.edu', free: true }
    ],
    practiceTasks: [
      'Implement Binary Search, Breadth-First Search (BFS), and Depth-First Search (DFS).',
      'Analyze Big-O time and space complexity across algorithmic variants.'
    ],
    suggestedProjects: [
      { title: 'Interactive Graph & Pathfinding Visualizer', difficulty: 'Intermediate', description: 'Visualize Dijkstra and A* pathfinding on customizable grid maps in the browser.' }
    ],
    isSaved: false
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning Algorithms',
    category: 'Data & AI',
    proficiency: 'Beginner',
    description: 'Supervised and unsupervised statistical learning: regression, classification, clustering, random forests, and gradient boosting.',
    relevance: 'Pivotal for Data Science, AI/ML engineering, and predictive quantitative analytics.',
    prerequisites: ['Python', 'Applied Statistics & Linear Algebra'],
    learningResources: [
      { title: 'Machine Learning Specialization by Andrew Ng', type: 'Course', provider: 'DeepLearning.AI / Coursera', url: 'https://www.coursera.org/specializations/machine-learning-introduction', free: false },
      { title: 'Scikit-Learn User Guide', type: 'Documentation', provider: 'Scikit-Learn Developers', url: 'https://scikit-learn.org/stable/user_guide.html', free: true }
    ],
    practiceTasks: [
      'Build a housing price predictor using Regularized Linear Regression and cross-validation.',
      'Evaluate model performance with precision, recall, F1-score, and ROC-AUC curves.'
    ],
    suggestedProjects: [
      { title: 'Customer Churn Prediction Engine', difficulty: 'Intermediate', description: 'Train XGBoost on telecom customer records and explain model feature importances using SHAP.' }
    ],
    isSaved: false
  },
  {
    id: 'networking',
    name: 'Computer Networking & Protocols',
    category: 'Cybersecurity',
    proficiency: 'Beginner',
    description: 'Foundations of data transmission: OSI Model, TCP/IP stack, DNS, HTTP/HTTPS, SSL/TLS handshakes, and subnetting.',
    relevance: 'Essential for Cybersecurity, Cloud Engineering, DevOps, and backend software reliability.',
    prerequisites: ['Basic Computing Concepts'],
    learningResources: [
      { title: 'Computer Networking: A Top-Down Approach', type: 'Book', provider: 'Kurose & Ross', url: 'https://www.pearson.com', free: false },
      { title: 'Professor Messer CompTIA Network+ Training Videos', type: 'Video', provider: 'Professor Messer', url: 'https://www.professormesser.com', free: true }
    ],
    practiceTasks: [
      'Capture and inspect packet handshakes (TCP SYN/ACK and TLS 1.3) using Wireshark.',
      'Calculate IPv4 CIDR subnets, broadcast addresses, and assignable host ranges.'
    ],
    suggestedProjects: [
      { title: 'Custom Network Packet Sniffer & Analyzer', difficulty: 'Intermediate', description: 'Write a Python script using Scapy to analyze traffic types and alert on unusual port access.' }
    ],
    isSaved: false
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@university.edu',
  currentEducationLevel: "Bachelor's Degree (Undergraduate)",
  fieldOfStudy: 'Computer Science & Information Systems',
  graduationYear: '2025',
  careerGoals: [
    'Secure an entry-level software or full-stack developer role at an innovative tech company',
    'Bridge theoretical university computer science with practical production tools',
    'Build an ATS-optimized technical resume that highlights project impact'
  ],
  primaryTargetCareerId: 'software-developer',
  preferredExperienceLevel: 'Entry-Level',
  interests: ['Web Applications', 'API Architecture', 'Cloud Services', 'UI/UX Craft'],
  isOnboardingCompleted: true,
  onboardingStep: 5,
  isDemoUser: true,
  preferences: {
    emailNotifications: false,
    roadmapReminders: true,
    highContrastMode: false,
    compactView: false
  }
};

export const INITIAL_ROADMAPS: CareerRoadmap[] = [
  {
    id: 'roadmap-software-dev-1',
    targetCareerId: 'software-developer',
    targetCareerTitle: 'Software Developer',
    startingLevel: 'Beginner',
    createdAt: '2024-03-01',
    updatedAt: '2024-04-10',
    isAiGenerated: false,
    stages: [
      {
        id: 'stage-1',
        order: 1,
        title: 'Stage 1: Core Programming & Version Control',
        description: 'Master programmatic thinking, functional patterns, object modeling, and Git collaboration workflows.',
        durationWeeks: 4,
        milestones: [
          {
            id: 'm1-1',
            title: 'Master TypeScript Foundations & Strict Typings',
            completed: true,
            skillsCovered: ['JavaScript / TypeScript', 'Programming Logic'],
            tasks: [
              { id: 't1-1-1', title: 'Complete TypeScript handbook section on Generics and Discriminated Unions', completed: true, estimatedHours: 6 },
              { id: 't1-1-2', title: 'Refactor 3 vanilla JavaScript scripts to strictly typed TypeScript', completed: true, estimatedHours: 4 }
            ]
          },
          {
            id: 'm1-2',
            title: 'Git Collaboration & Open Source Workflow',
            completed: true,
            skillsCovered: ['Git & Version Control'],
            tasks: [
              { id: 't1-2-1', title: 'Practice branch rebasing, squashing, and conflict resolution', completed: true, estimatedHours: 4 },
              { id: 't1-2-2', title: 'Submit a valid pull request to an open source project repository', completed: true, estimatedHours: 5 }
            ]
          }
        ]
      },
      {
        id: 'stage-2',
        order: 2,
        title: 'Stage 2: Algorithmic Thinking & Databases',
        description: 'Deepen problem-solving capability with core data structures and relational data design.',
        durationWeeks: 6,
        milestones: [
          {
            id: 'm2-1',
            title: 'Relational Database Schema Design & SQL Optimization',
            completed: true,
            skillsCovered: ['SQL & Relational Databases'],
            tasks: [
              { id: 't2-1-1', title: 'Design normalized schemas with indexes and foreign key constraints', completed: true, estimatedHours: 8 },
              { id: 't2-1-2', title: 'Write complex analytical queries utilizing window functions and subqueries', completed: true, estimatedHours: 6 }
            ],
            suggestedProject: {
              title: 'Multi-Tenant Database Architecture Spec',
              description: 'Model a relational database supporting organizations, workspaces, and role permissions.',
              deliverables: ['SQL DDL scripts', 'ER Diagram', 'Query performance benchmarks']
            }
          },
          {
            id: 'm2-2',
            title: 'Data Structures & Algorithmic Practice',
            completed: false,
            skillsCovered: ['Data Structures & Algorithms'],
            tasks: [
              { id: 't2-2-1', title: 'Solve 25 LeetCode/NeetCode medium problems on Trees and Two Pointers', completed: true, estimatedHours: 15 },
              { id: 't2-2-2', title: 'Implement Depth-First Search and Dijkstra Shortest Path algorithms', completed: false, estimatedHours: 8 }
            ]
          }
        ]
      },
      {
        id: 'stage-3',
        order: 3,
        title: 'Stage 3: Full Stack Integration & API Architecture',
        description: 'Connect client interfaces with backend services, authentication tokens, and caching layers.',
        durationWeeks: 6,
        milestones: [
          {
            id: 'm3-1',
            title: 'RESTful API Engineering & Async Service Design',
            completed: false,
            skillsCovered: ['RESTful API Design', 'Node.js', 'Express'],
            tasks: [
              { id: 't3-1-1', title: 'Build a secure REST API with JWT authentication and rate limiting', completed: false, estimatedHours: 12 },
              { id: 't3-1-2', title: 'Write comprehensive integration tests using Vitest or Jest', completed: false, estimatedHours: 6 }
            ],
            suggestedProject: {
              title: 'Production REST API with OpenTelemetry',
              description: 'Construct a production microservice with structured JSON logging and health probes.',
              deliverables: ['GitHub repo with CI/CD', 'Live deployed API endpoint', 'Interactive OpenAPI docs']
            }
          },
          {
            id: 'm3-2',
            title: 'Containerization & Cloud Deployment',
            completed: false,
            skillsCovered: ['Docker & Containerization', 'Cloud & DevOps'],
            tasks: [
              { id: 't3-2-1', title: 'Create multi-stage Dockerfiles and deploy to container cloud runner', completed: false, estimatedHours: 8 },
              { id: 't3-2-2', title: 'Configure continuous deployment workflow using GitHub Actions', completed: false, estimatedHours: 6 }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_RESUMES: ResumeProfile[] = [
  {
    id: 'resume-sample-1',
    title: 'Software Developer Resume (Technical)',
    updatedAt: '2024-04-12',
    personalInfo: {
      fullName: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA (Open to Remote)',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      portfolioUrl: 'https://alexmorgan.dev',
      githubUrl: 'https://github.com/alexmorgandev'
    },
    targetRole: 'Junior Software Developer',
    professionalSummary: 'Proactive Computer Science undergraduate with hands-on experience building full-stack web applications and scalable REST APIs. Skilled in TypeScript, React, Python, and SQL, with a passion for writing clean, tested code and delivering accessible user interfaces.',
    skills: [
      {
        category: 'Programming Languages',
        items: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL (PostgreSQL)', 'HTML5', 'CSS3']
      },
      {
        category: 'Frameworks & Libraries',
        items: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Vite', 'FastAPI']
      },
      {
        category: 'Tools & DevOps',
        items: ['Git', 'GitHub Actions', 'Docker', 'Postman', 'VS Code', 'Linux CLI']
      }
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'Campus Tech Innovations Lab',
        position: 'Software Engineering Intern',
        location: 'Berkeley, CA',
        startDate: 'May 2023',
        endDate: 'August 2023',
        isCurrent: false,
        description: 'Engineered student services web portal serving over 4,500 active campus users.',
        bullets: [
          'Engineered 8 reusable React and TypeScript components, reducing page load latency by 32% and achieving WCAG 2.1 AA accessibility compliance.',
          'Built RESTful API endpoints in Node.js/Express to query PostgreSQL database, decreasing average query response time from 420ms to 95ms.',
          'Configured automated GitHub Actions CI pipeline running unit tests and linting on every pull request, cutting merge regressions by 40%.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: 'August 2021',
        endDate: 'May 2025 (Expected)',
        isCurrent: true,
        gpa: '3.82 / 4.00',
        achievements: [
          "Dean's Honor List for 5 consecutive semesters",
          'Relevant Coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Software Engineering Principles'
        ]
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'CareerPilot AI Guidance Platform',
        role: 'Sole Full-Stack Developer',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Express', 'Node.js'],
        link: 'https://careerpilot-ai.dev',
        bullets: [
          'Architected an end-to-end career navigation application supporting 10 career paths and 70+ technology skills.',
          'Developed responsive ATS resume scoring engine analyzing keyword density and formatting with sub-second response times.',
          'Implemented accessible UI conforming strictly to WCAG 2.2 AA standards with keyboard navigation and dark-purple brand tokens.'
        ]
      },
      {
        id: 'proj-2',
        title: 'Cloud Metrics Telemetry Monitor',
        role: 'Backend Developer',
        technologies: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
        link: 'https://github.com/alexmorgandev/cloud-metrics',
        bullets: [
          'Constructed asynchronous Python data pipeline polling CPU and memory usage from 12 virtual containers every 5 seconds.',
          'Implemented SQL time-series rollups to compress historical records by 60% without loss of diagnostic fidelity.'
        ]
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: 'November 2023',
        credentialId: 'AWS-CCP-928174',
        credentialUrl: 'https://aws.amazon.com/verification'
      }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Conversational' }
    ]
  }
];
