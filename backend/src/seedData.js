require("dotenv").config();
const bcrypt = require("bcryptjs");
const supabase = require("./db");

/* ============================================================
   DEFAULT CONTENT
   Mirrors the structure the frontend expects. Each top-level key
   becomes one row in the `content` table (JSON-serialized).
   ============================================================ */
const DEFAULT_DATA = {
  profile: {
    name: "Mariam Hakro",
    title: "Data Analyst | Computer Science Student",
    tagline: "Turning data into decisions and ideas into full-stack applications.",
    location: "Mirpurkhas, Sindh, Pakistan",
    email: "mariamhakro24@gmail.com",
    phone: "+92 336 3028825",
    about:
      "Motivated Computer Science student with hands-on experience in data analysis, cybersecurity fundamentals, and full-stack web development. Skilled in applying machine learning and data visualization to support data-driven decisions, with strong leadership and analytical ability and a growing interest in applying technology to secure, efficient banking operations.",
    goals:
      "Currently looking for data analyst or software engineering opportunities where I can apply machine learning, data visualization, and full-stack development to solve real business problems — especially in secure, data-driven environments like banking and fintech.",
    specializations: ["Data Analysis", "Machine Learning", "Full-Stack Development", "Cybersecurity"],
    social: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/mariam-hakro-learner",
      twitter: "",
      dribbble: ""
    }
  },
  skills: [
    { name: "Python (Django)", level: 85, category: "Language" },
    { name: "Pandas, NumPy, EDA", level: 88, category: "Data" },
    { name: "HTML, CSS, JavaScript", level: 80, category: "Frontend" },
    { name: "MySQL, PostgreSQL, SQLite", level: 78, category: "Backend" },
    { name: "Frontend & Backend Development", level: 80, category: "Full-Stack" },
    { name: "Networking Fundamentals", level: 72, category: "Cybersecurity" },
    { name: "Cybersecurity Awareness", level: 75, category: "Cybersecurity" },
    { name: "MS Office & Documentation", level: 90, category: "Tooling" }
  ],
  technologies: {
    Frontend: ["HTML5", "CSS3", "JavaScript"],
    Backend: ["Python", "Django", "REST APIs"],
    Database: ["MySQL", "PostgreSQL", "SQLite"],
    "AI & Data": ["Pandas", "NumPy", "Exploratory Data Analysis", "Machine Learning", "Quantum Machine Learning"],
    "Cybersecurity & Networking": ["Scapy", "Intrusion Detection", "Networking Fundamentals"],
    "Dev Tools": ["MS Office & Documentation", "Looker Studio"]
  },
  projects: [
    {
      id: "p1",
      title: "QIDS — Hybrid Intrusion Detection System",
      description:
        "Final year project combining classical and quantum machine learning to detect and classify cyberattacks, with a real-time Django dashboard for live threat visualization.",
      features: [
        "Real-time network monitoring with Scapy",
        "AI-based attack detection, risk scoring & alerting",
        "Automated PDF report generation",
        "Benchmarked 5 classical & 2 quantum ML models on CICIDS2017 (precision, recall, F1, execution time)"
      ],
      tech: ["Python", "Django", "Scapy", "Classical ML", "Quantum ML"],
      github: "https://github.com/",
      demo: "",
      featured: true
    },
    {
      id: "p2",
      title: "EventToEase — Digital Event Management System",
      description:
        "A digital event booking platform built as part of a group project, handling user data and system workflow with concepts transferable to banking-style digital service platforms.",
      features: ["Event booking & management", "Structured information management", "Multi-user workflow handling"],
      tech: ["Web Development", "Database Design"],
      github: "https://github.com/",
      demo: "",
      featured: true
    },
    {
      id: "p3",
      title: "Secure Client-Server Communication System",
      description:
        "An academic networking project simulating secure data transfer between systems using a structured request-response mechanism.",
      features: ["Client-server communication model", "IP communication & data transmission", "Connectivity handling"],
      tech: ["Networking", "Python"],
      github: "https://github.com/",
      demo: "",
      featured: false
    }
  ],
  experience: [
    {
      role: "Project Lead & AI Data Analyst",
      org: "Excelerate (Remote) — Data Analysis Remote Internship",
      period: "Add dates",
      description:
        "Analyzed historical learner application data using exploratory data analysis (EDA) and time-series analysis to identify seasonal trends and peak periods. Developed machine learning models to forecast application demand and identify high-performing opportunity categories. Built interactive dashboards in Looker Studio to communicate insights and support data-driven business decisions."
    },
    {
      role: "Data Visualization Associate",
      org: "Excelerate (Remote) — Data Handling & Analysis Internship",
      period: "Add dates",
      description:
        "Worked with structured datasets using Pandas and NumPy for data organization and analysis. Cleaned and processed raw data to generate actionable insights for reporting."
    }
  ],
  education: [
    {
      degree: "BS Computer Science",
      institution: "Sukkur IBA University, Mirpurkhas Campus",
      period: "2022 — Present",
      details: "CGPA: 3.06 / 4.0"
    },
    {
      degree: "HSC (Pre-Engineering)",
      institution: "Ibn-e-Rushed Girls College",
      period: "2017 — 2019",
      details: "Grade: A"
    },
    {
      degree: "SSC (Science Group)",
      institution: "Govt. Girls High School, Fruit Farm, Mirpurkhas",
      period: "2015 — 2017",
      details: "Grade: A"
    }
  ],
  certifications: [],
  services: [
    { title: "Data Analysis & Visualization", description: "Exploratory data analysis, dashboards, and reporting using Pandas, NumPy, and Looker Studio." },
    { title: "Machine Learning", description: "Building and benchmarking classical and quantum ML models for real-world classification problems." },
    { title: "Full-Stack Web Development", description: "Django-based backend development paired with HTML, CSS, and JavaScript frontends." },
    { title: "Cybersecurity Fundamentals", description: "Network monitoring, intrusion detection concepts, and secure client-server communication." }
  ],
  testimonials: [],
  blog: [
    {
      id: "b1",
      title: "Building QIDS: Classical and Quantum ML for Intrusion Detection",
      date: "2026-01-01",
      excerpt: "Notes from benchmarking 5 classical and 2 quantum ML models on the CICIDS2017 dataset.",
      body:
        "Placeholder post — replace with your own write-up on building QIDS: the real-time Scapy monitoring module, the Django dashboard, and what you learned comparing classical vs. quantum model performance on precision, recall, F1-score, and execution time."
    },
    {
      id: "b2",
      title: "What I Learned Forecasting Demand with EDA",
      date: "2026-01-01",
      excerpt: "Lessons from analyzing learner application data during my Excelerate internship.",
      body:
        "Placeholder post — replace with your own write-up on the time-series analysis and forecasting models you built during your Data Analysis internship at Excelerate, and how the Looker Studio dashboards helped stakeholders make decisions."
    }
  ]
};

async function seedContent() {
  // Only insert keys that don't already exist — never overwrites content
  // you've since edited through the admin panel.
  const { data: existing, error: fetchError } = await supabase.from("content").select("key");
  if (fetchError) throw fetchError;
  const existingKeys = new Set((existing || []).map((r) => r.key));

  const rows = Object.entries(DEFAULT_DATA)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => ({ key, value }));

  if (rows.length === 0) {
    console.log("All content keys already seeded — nothing to do.");
    return;
  }

  const { error } = await supabase.from("content").insert(rows);
  if (error) throw error;
  console.log(`Seeded ${rows.length} content key(s): ${rows.map((r) => r.key).join(", ")}`);
}

async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const { data: existing, error: fetchError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing) {
    console.log(`Admin user "${username}" already exists — leaving password unchanged.`);
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const { error } = await supabase.from("admin_users").insert({ username, password_hash: hash });
  if (error) throw error;
  console.log(`Created admin user "${username}".`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('No ADMIN_PASSWORD set in .env — using default "admin123". Change this before deploying.');
  }
}

if (require.main === module) {
  (async () => {
    try {
      await seedContent();
      await seedAdminUser();
      console.log("Seed complete.");
      process.exit(0);
    } catch (err) {
      console.error("Seeding failed:", err.message || err);
      process.exit(1);
    }
  })();
}

module.exports = { DEFAULT_DATA, seedContent, seedAdminUser };
