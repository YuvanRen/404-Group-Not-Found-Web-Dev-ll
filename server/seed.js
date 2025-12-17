import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';

const MONGO_URI = process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DATABASE || '404GroupCluster';
const NUM_EMPLOYERS = 20;
const NUM_JOBS = 200;

const firstNames = [
  'James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley',
  'William', 'Amanda', 'Richard', 'Stephanie', 'Joseph', 'Nicole', 'Thomas',
  'Elizabeth', 'Christopher', 'Heather', 'Daniel', 'Michelle', 'Matthew', 'Laura',
  'Anthony', 'Rebecca', 'Mark', 'Jennifer', 'Steven', 'Rachel', 'Andrew', 'Karen'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const companies = [
  'TechCorp', 'InnovateSoft', 'DataDynamics', 'CloudNine Systems', 'Quantum Labs',
  'Digital Frontier', 'CodeCraft', 'ByteWorks', 'Nexus Technologies', 'Apex Software',
  'Stellar Systems', 'Pioneer Tech', 'Fusion Innovations', 'Vertex Solutions',
  'Prism Digital', 'Catalyst Computing', 'Horizon Tech', 'Synergy Systems',
  'Elevate Software', 'Momentum Labs'
];

const jobTitles = {
  'Software Development': [
    'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'Software Architect', 'Junior Developer',
    'Lead Software Engineer', 'DevOps Engineer', 'Platform Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer'
  ],
  'Data Science': [
    'Data Scientist', 'Machine Learning Engineer', 'Data Analyst',
    'AI Research Scientist', 'Data Engineer', 'Business Intelligence Analyst',
    'ML Ops Engineer', 'NLP Engineer', 'Computer Vision Engineer'
  ],
  'Product Management': [
    'Product Manager', 'Senior Product Manager', 'Associate Product Manager',
    'Technical Product Manager', 'Product Owner', 'Director of Product'
  ],
  'Design': [
    'UX Designer', 'UI Designer', 'Product Designer', 'UX Researcher',
    'Visual Designer', 'Design Lead', 'Interaction Designer'
  ],
  'Marketing': [
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist',
    'SEO Specialist', 'Growth Marketing Manager', 'Brand Manager',
    'Social Media Manager', 'Marketing Analyst'
  ],
  'Sales': [
    'Sales Representative', 'Account Executive', 'Sales Manager',
    'Business Development Representative', 'Enterprise Account Executive',
    'Sales Engineer', 'Customer Success Manager'
  ],
  'Human Resources': [
    'HR Manager', 'Recruiter', 'Technical Recruiter', 'HR Business Partner',
    'Talent Acquisition Specialist', 'People Operations Manager'
  ],
  'Finance': [
    'Financial Analyst', 'Accountant', 'Finance Manager', 'Controller',
    'FP&A Analyst', 'Tax Specialist', 'Payroll Specialist'
  ],
  'Cybersecurity': [
    'Security Engineer', 'Security Analyst', 'Penetration Tester',
    'Security Architect', 'SOC Analyst', 'Application Security Engineer'
  ],
  'Cloud & Infrastructure': [
    'Cloud Engineer', 'Site Reliability Engineer', 'Systems Administrator',
    'Network Engineer', 'Infrastructure Engineer', 'Cloud Architect'
  ]
};

const skillsByField = {
  'Software Development': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'Microservices'
  ],
  'Data Science': [
    'Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
    'NumPy', 'Spark', 'Hadoop', 'Tableau', 'Power BI', 'Statistics',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'A/B Testing'
  ],
  'Product Management': [
    'Agile', 'Scrum', 'JIRA', 'Product Strategy', 'User Research', 'A/B Testing',
    'Roadmapping', 'Stakeholder Management', 'Data Analysis', 'SQL', 'Figma'
  ],
  'Design': [
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InVision',
    'Prototyping', 'User Research', 'Wireframing', 'Design Systems', 'HTML', 'CSS'
  ],
  'Marketing': [
    'Google Analytics', 'SEO', 'SEM', 'Content Marketing', 'Social Media',
    'Email Marketing', 'HubSpot', 'Salesforce', 'Copywriting', 'A/B Testing'
  ],
  'Sales': [
    'Salesforce', 'HubSpot', 'Cold Calling', 'Negotiation', 'CRM',
    'Lead Generation', 'Account Management', 'Sales Strategy', 'Presentation'
  ],
  'Human Resources': [
    'Recruiting', 'HRIS', 'Employee Relations', 'Benefits Administration',
    'Onboarding', 'Performance Management', 'Workday', 'ADP', 'LinkedIn Recruiter'
  ],
  'Finance': [
    'Excel', 'Financial Modeling', 'QuickBooks', 'SAP', 'GAAP', 'Budgeting',
    'Forecasting', 'Variance Analysis', 'Accounts Payable', 'Accounts Receivable'
  ],
  'Cybersecurity': [
    'Network Security', 'Penetration Testing', 'SIEM', 'Firewalls', 'IDS/IPS',
    'Vulnerability Assessment', 'Security Frameworks', 'Python', 'Linux', 'AWS Security'
  ],
  'Cloud & Infrastructure': [
    'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Docker', 'Kubernetes',
    'Linux', 'Networking', 'CI/CD', 'Monitoring', 'Prometheus', 'Grafana'
  ]
};

const locations = [
  'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Seattle, WA',
  'Austin, TX', 'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA',
  'Miami, FL', 'Portland, OR', 'San Diego, CA', 'Dallas, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'Washington, DC', 'Minneapolis, MN', 'Detroit, MI',
  'Remote', 'Hybrid - New York', 'Hybrid - San Francisco', 'Hybrid - Austin'
];

const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];

const descriptionTemplates = [
  {
    intro: "We are looking for a talented {title} to join our growing team at {company}.",
    body: "In this role, you will be responsible for designing, developing, and maintaining high-quality solutions that drive our business forward. You'll collaborate with cross-functional teams to deliver innovative products that delight our customers.",
    requirements: "The ideal candidate has strong problem-solving skills, excellent communication abilities, and a passion for technology."
  },
  {
    intro: "{company} is seeking an experienced {title} to help us scale our platform.",
    body: "You'll work on challenging problems, mentor junior team members, and contribute to architectural decisions. Our team values collaboration, continuous learning, and shipping quality work.",
    requirements: "We're looking for someone who thrives in a fast-paced environment and isn't afraid to take ownership of projects from conception to deployment."
  },
  {
    intro: "Join {company} as a {title} and make an impact from day one!",
    body: "We're building the next generation of technology solutions, and we need talented individuals to help us get there. You'll have the opportunity to work with cutting-edge technologies and shape the direction of our products.",
    requirements: "If you're passionate about building great products and want to work with a team of talented professionals, we'd love to hear from you."
  },
  {
    intro: "Are you ready to take your career to the next level? {company} is hiring a {title}!",
    body: "This is an exciting opportunity to join a dynamic team working on innovative projects. You'll contribute to all phases of the development lifecycle and help us deliver exceptional solutions to our clients.",
    requirements: "We value diverse perspectives and encourage candidates from all backgrounds to apply."
  },
  {
    intro: "{company} is on a mission to transform the industry, and we need a {title} to help us achieve our goals.",
    body: "As part of our team, you'll tackle complex challenges, drive technical excellence, and help shape the future of our platform. We offer competitive compensation, great benefits, and a supportive work environment.",
    requirements: "The ideal candidate is a self-starter who can work independently while also being a great team player."
  }
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(daysBack = 90) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

function generateEmail(firstName, lastName, company) {
  const domain = company.toLowerCase().replace(/\s+/g, '') + '.com';
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`,
  ];
  return randomElement(formats);
}

function generateDescription(title, company) {
  const template = randomElement(descriptionTemplates);
  const intro = template.intro.replace('{title}', title).replace('{company}', company);
  const body = template.body;
  const requirements = template.requirements;
  
  return `${intro}\n\n${body}\n\n${requirements}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    const jobsCollection = db.collection('jobs');
    
    const employers = [];
    
    for (let i = 0; i < NUM_EMPLOYERS; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const company = companies[i % companies.length];
      
      const employer = {
        _id: new ObjectId(),
        email: generateEmail(firstName, lastName, company),
        passwordHash: hashPassword('password123'),
        name: `${firstName} ${lastName}`,
        userType: 'employer',
        company: company,
        createdAt: randomDate(180)
      };
      
      employers.push(employer);
    }
    
    await usersCollection.insertMany(employers);
    console.log(`Created ${employers.length} employers`);
    
    const jobSeekers = [];
    
    for (let i = 0; i < 20; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      
      const seeker = {
        _id: new ObjectId(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        passwordHash: hashPassword('password123'),
        name: `${firstName} ${lastName}`,
        userType: 'jobseeker',
        createdAt: randomDate(180)
      };
      
      jobSeekers.push(seeker);
    }
    
    await usersCollection.insertMany(jobSeekers);
    const jobs = [];
    const fields = Object.keys(jobTitles);
    
    for (let i = 0; i < NUM_JOBS; i++) {
      const employer = randomElement(employers);
      const field = randomElement(fields);
      const title = randomElement(jobTitles[field]);
      const skills = randomElements(skillsByField[field], 3, 8);
      
      const job = {
        _id: new ObjectId(),
        employerId: employer._id,
        title: title,
        description: generateDescription(title, employer.company),
        field: field,
        skills: skills,
        type: randomElement(jobTypes),
        location: randomElement(locations),
        applyLink: `https://${employer.company.toLowerCase().replace(/\s+/g, '')}.com/careers/${i}`,
        active: Math.random() > 0.1,
        createdAt: randomDate(60),
        updatedAt: null
      };
      
      jobs.push(job);
    }
    
    await jobsCollection.insertMany(jobs);
    console.log(`Created ${jobs.length} job postings`);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

seed();