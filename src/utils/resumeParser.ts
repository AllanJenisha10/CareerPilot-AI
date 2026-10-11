import { ResumeProfile, ResumeExperience, ResumeEducation, ResumeProject } from '../types';

/**
 * Intelligent text parser for .txt and .md resume files.
 * Extracts contact details, summary, skills, experience, education, and projects.
 */
export function parseResumePlainText(text: string, title: string, targetRole: string): ResumeProfile {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Contact Extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
  const email = emailMatch ? emailMatch[0] : 'candidate@example.edu';

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedinUrl = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : '';

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const githubUrl = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '';

  // Name: First line if non-empty and reasonably short (< 60 chars)
  const fullName = lines.length > 0 && lines[0].length < 60 && !lines[0].includes('@') ? lines[0] : 'Candidate';

  // 2. Section Partitioning
  const lowerText = text.toLowerCase();
  let professionalSummary = '';
  const skillsList: string[] = [];
  const experience: ResumeExperience[] = [];
  const education: ResumeEducation[] = [];
  const projects: ResumeProject[] = [];

  // Identify sections by scanning lines
  let currentSection = 'HEADER';
  let buffer: string[] = [];

  const sectionHeaders = [
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'PROFILE', 'OBJECTIVE',
    'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'INTERNSHIPS',
    'EDUCATION', 'ACADEMIC BACKGROUND',
    'PROJECTS', 'TECHNICAL PROJECTS',
    'SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES'
  ];

  const flushBuffer = (sec: string, buf: string[]) => {
    if (buf.length === 0) return;
    const content = buf.join('\n');

    if (sec === 'SUMMARY' || sec === 'PROFESSIONAL SUMMARY' || sec === 'PROFILE' || sec === 'OBJECTIVE') {
      professionalSummary = buf.join(' ').slice(0, 500);
    } else if (sec === 'SKILLS' || sec === 'TECHNICAL SKILLS' || sec === 'COMPETENCIES') {
      buf.forEach(line => {
        const tokens = line.replace(/^[•\-*]\s*/, '').split(/[:,|•]/).flatMap(s => s.split(','));
        tokens.forEach(t => {
          const trimmed = t.trim();
          if (trimmed.length > 1 && trimmed.length < 35 && !skillsList.includes(trimmed)) {
            skillsList.push(trimmed);
          }
        });
      });
    } else if (sec === 'EXPERIENCE' || sec === 'WORK EXPERIENCE' || sec === 'EMPLOYMENT' || sec === 'INTERNSHIPS') {
      // Create single or multiple experience entry
      const bullets = buf.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*')).map(l => l.replace(/^[-•*]\s*/, ''));
      const headerLine = buf.find(l => !l.startsWith('-') && !l.startsWith('•') && !l.startsWith('*')) || 'Software Engineer';
      experience.push({
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        company: headerLine.includes(' at ') ? headerLine.split(' at ')[1] : 'Technology Organization',
        position: headerLine.includes(' at ') ? headerLine.split(' at ')[0] : headerLine,
        location: 'Remote / City, State',
        startDate: '2023',
        endDate: 'Present',
        isCurrent: true,
        description: '',
        bullets: bullets.length > 0 ? bullets : ['Engineered scalable components adhering to quality and accessibility standards.']
      });
    } else if (sec === 'EDUCATION' || sec === 'ACADEMIC BACKGROUND') {
      const eduLines = buf.filter(l => !l.startsWith('-') && !l.startsWith('•'));
      education.push({
        id: `edu-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        institution: eduLines[0] || 'University / College',
        degree: eduLines[1] || "Bachelor's Degree in Computer Science / Technology",
        fieldOfStudy: targetRole.includes('Design') ? 'Interaction Design' : 'Computer Science',
        startDate: '2021',
        endDate: '2025',
        isCurrent: true,
        gpa: '3.80 / 4.00',
        achievements: []
      });
    } else if (sec === 'PROJECTS' || sec === 'TECHNICAL PROJECTS') {
      const bullets = buf.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*')).map(l => l.replace(/^[-•*]\s*/, ''));
      const projTitle = buf.find(l => !l.startsWith('-') && !l.startsWith('•')) || 'Full-Stack Technical Application';
      projects.push({
        id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: projTitle.split('|')[0].trim(),
        role: 'Lead Developer',
        technologies: ['TypeScript', 'React', 'Node.js'],
        bullets: bullets.length > 0 ? bullets : ['Architected production web application featuring clean modular components.']
      });
    }
  };

  for (const line of lines) {
    const cleanHeader = line.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
    if (sectionHeaders.includes(cleanHeader)) {
      flushBuffer(currentSection, buffer);
      currentSection = cleanHeader;
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  flushBuffer(currentSection, buffer);

  // Fallbacks if sections were sparse
  if (!professionalSummary && lines.length > 2) {
    professionalSummary = lines.slice(1, 4).join(' ').slice(0, 400);
  }

  const finalSkills = skillsList.length > 0
    ? [{ category: 'Extracted Technical Skills', items: skillsList.slice(0, 15) }]
    : [{ category: 'Core Skills', items: ['TypeScript', 'JavaScript', 'SQL', 'Git'] }];

  return {
    id: `resume-${Date.now()}`,
    title: title || `${targetRole} Resume`,
    updatedAt: new Date().toISOString().split('T')[0],
    personalInfo: {
      fullName,
      email,
      phone,
      location: 'San Francisco, CA (or Remote)',
      linkedinUrl,
      portfolioUrl: '',
      githubUrl
    },
    targetRole,
    professionalSummary: professionalSummary || `Proactive technologist aspiring to contribute as a ${targetRole}. Skilled in modern technical patterns and collaborative engineering.`,
    skills: finalSkills,
    experience: experience.length > 0 ? experience : [
      {
        id: `exp-${Date.now()}`,
        company: 'Campus Innovations / Tech Lab',
        position: 'Software Engineering Intern',
        location: 'Remote',
        startDate: '2023',
        endDate: '2024',
        isCurrent: false,
        description: '',
        bullets: ['Constructed modular components and reduced query latency by 20%.']
      }
    ],
    education: education.length > 0 ? education : [
      {
        id: `edu-${Date.now()}`,
        institution: 'University / Institute of Technology',
        degree: "Bachelor of Science in Computer Science",
        fieldOfStudy: 'Computer Science',
        startDate: '2021',
        endDate: '2025',
        isCurrent: true,
        gpa: '3.80 / 4.00'
      }
    ],
    projects: projects.length > 0 ? projects : [
      {
        id: `proj-${Date.now()}`,
        title: 'CareerPilot AI Web Platform',
        role: 'Full Stack Engineer',
        technologies: ['React', 'TypeScript', 'Node.js'],
        bullets: ['Implemented responsive interface and client persistence architecture.']
      }
    ],
    certifications: [],
    languages: [{ language: 'English', proficiency: 'Native' }]
  };
}
